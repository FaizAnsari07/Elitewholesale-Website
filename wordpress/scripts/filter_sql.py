"""Filter the (prefix-fixed) WordPress SQL dump down to a minimal, safe
whitelist of tables needed for a headless WooCommerce product/category/brand
backend. Excludes Wordfence logs, order/customer PII, form submissions,
Revolution Slider, and other inactive-plugin tables. `users`/`usermeta`
schema is kept (WordPress core requires the tables to exist) but their real
row data is dropped -- a fresh local admin is created separately via WP-CLI.
"""
import re
import sys

FULL_TABLES = {
    "options", "posts", "postmeta", "terms", "term_taxonomy",
    "term_relationships", "termmeta", "comments", "commentmeta",
    "actionscheduler_actions", "actionscheduler_claims", "actionscheduler_groups",
    "woocommerce_attribute_taxonomies",
    "woocommerce_shipping_zones", "woocommerce_shipping_zone_locations",
    "woocommerce_shipping_zone_methods", "woocommerce_tax_rates",
    "woocommerce_tax_rate_locations", "wc_tax_rate_classes",
    "wc_category_lookup", "wc_product_meta_lookup", "wc_product_attributes_lookup",
    "wc_product_download_directories", "wc_reserved_stock", "wc_rate_limits",
    "actionscheduler_logs",
}
SCHEMA_ONLY_TABLES = {"users", "usermeta"}

STMT_START_RE = re.compile(
    r"^(DROP TABLE IF EXISTS|CREATE TABLE|INSERT INTO|LOCK TABLES|UNLOCK TABLES|ALTER TABLE)\s*`?wp_([a-zA-Z0-9_]+)`?"
)

def table_action(table):
    if table in FULL_TABLES:
        return "keep"
    if table in SCHEMA_ONLY_TABLES:
        return "schema_only"
    return "drop"

def main(in_path, out_path):
    kept_lines = 0
    dropped_lines = 0
    with open(in_path, "r", encoding="utf-8", errors="replace") as fin, \
         open(out_path, "w", encoding="utf-8") as fout:
        current_table = None
        current_action = "keep"  # for header/comment lines before any table
        in_multiline_create = False
        for line in fin:
            m = STMT_START_RE.match(line)
            if m:
                stmt, table = m.group(1), m.group(2)
                current_table = table
                current_action = table_action(table)
                if stmt == "CREATE TABLE" and not line.rstrip().endswith(";"):
                    in_multiline_create = True
                else:
                    in_multiline_create = False
                if stmt == "INSERT INTO" and current_action == "schema_only":
                    dropped_lines += 1
                    continue
                if current_action == "drop":
                    dropped_lines += 1
                    continue
                fout.write(line)
                kept_lines += 1
                continue
            if in_multiline_create:
                if current_action == "drop":
                    dropped_lines += 1
                else:
                    fout.write(line)
                    kept_lines += 1
                if line.rstrip().endswith(";"):
                    in_multiline_create = False
                continue
            # continuation of a previous multi-line statement (e.g. multi-row INSERT), or a
            # stray line (comments, blank lines) -- follow the current table's action.
            if current_action == "drop" or (current_action == "schema_only" and current_table not in FULL_TABLES):
                # only schema (CREATE) lines should reach here for schema_only tables during
                # multiline handling above; plain top-level comment/blank lines default to keep
                if line.strip() == "" or line.startswith("--"):
                    fout.write(line)
                    kept_lines += 1
                else:
                    dropped_lines += 1
                continue
            fout.write(line)
            kept_lines += 1
    print(f"kept {kept_lines} lines, dropped {dropped_lines} lines -> {out_path}")

if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2])
