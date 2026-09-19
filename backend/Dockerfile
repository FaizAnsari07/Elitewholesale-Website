FROM php:8.2-apache
RUN docker-php-ext-install pdo_mysql \
 && cp "$PHP_INI_DIR/php.ini-production" "$PHP_INI_DIR/php.ini" \
 && sed -ri 's#/var/www/html#/var/www/public#g' /etc/apache2/sites-available/000-default.conf /etc/apache2/apache2.conf
COPY docker/php-prod.ini $PHP_INI_DIR/conf.d/zz-prod.ini
COPY docker/apache-security.conf /etc/apache2/conf-enabled/zz-security.conf
COPY lib /var/www/lib
COPY public /var/www/public
RUN mkdir -p /var/www/public/uploads && chown -R www-data:www-data /var/www/public/uploads
