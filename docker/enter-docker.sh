scrapeconfig_container_id=`sudo docker ps --format {{.ID}} -f ancestor=siegfried415/scrapeconfig-dashboard`
echo $scrapeconfig_container_id
scrapeconfig_container_pid=`sudo docker inspect --format {{.State.Pid}} $scrapeconfig_container_id`
echo $scrapeconfig_container_pid
sudo nsenter --target $scrapeconfig_container_pid --mount --uts --ipc --net --pid
