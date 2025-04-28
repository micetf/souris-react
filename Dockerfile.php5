FROM php:5.6-apache

# Installation des extensions PHP nécessaires
RUN docker-php-ext-install mysqli pdo pdo_mysql

# Configuration d'Apache pour autoriser les requêtes CORS
RUN a2enmod headers rewrite

# Copier la configuration Apache personnalisée si nécessaire
COPY docker/apache.conf /etc/apache2/sites-available/000-default.conf

# Définir le répertoire de travail
WORKDIR /var/www/html

# Copier les fichiers API
COPY api/ /var/www/html/api/
COPY public/records/ /var/www/html/records/
RUN chmod -R 777 /var/www/html/records

# Définir les permissions appropriées
RUN chown -R www-data:www-data /var/www/html