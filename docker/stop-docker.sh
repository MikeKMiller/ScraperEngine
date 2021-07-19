scrapeconfig_container_id=`sudo docker ps --format {{.ID}} -f ancestor=siegfried415/scrapeconfig-dashboard`
echo $scrapeconfig_container_id
sudo docker stop $scrapeconfig_container_id 
