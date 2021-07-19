service rabbitmq-server start
celery worker -A scrapeconfig_dashboard -B -l debug 
