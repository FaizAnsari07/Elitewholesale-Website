FROM php:8.2-apache
RUN docker-php-ext-install pdo_mysql \
 && sed -ri 's#/var/www/html#/var/www/public#g' /etc/apache2/sites-available/000-default.conf /etc/apache2/apache2.conf
