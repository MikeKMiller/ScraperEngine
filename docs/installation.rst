.. _installation:

Installation
============

Docker (recommended)
--------------------

If you are on a Linux machine you will need `Docker <https://docs.docker.com/installation/>`_ installed or if you are using a `Windows <https://docs.docker.com/installation/windows/>`_ or `Mac OS X <https://docs.docker.com/installation/mac/>`_ machine you will need `boot2docker <http://boot2docker.io/>`_.

You can run ScrapeConfig with the command below::

    sudo docker run -i -t --rm -v <PROJECTS_FOLDER>:/app/data/projects:rw -p 9001:9001 siegfried415/scrapeconfig-dashboard start-dev 

ScrapeConfig will now be running on port 9001 and you can access it at ``http://localhost:9001``.
Projects will be stored in the project folder that you mount to docker.

If you want to login into server, you can use `nsenter <https://github.com/jpetazzo/nsenter>`_ which can be installed by ::

    sudo docker run --rm -v /usr/local/bin:/target jpetazzo/nsenter

Before entering scrapeconfig container, you must figure out the  PID of it by ::

    scrapeconfig_container_id=`sudo docker ps --format {{.ID}} -f ancestor=siegfried415/scrapeconfig-dashboard`
    scrapeconfig_container_pid=`sudo docker inspect --format {{.State.Pid}} $scrapeconfig_container_id`

Then enter the container:: 

    sudo nsenter --target $scrapeconfig_container_pid --mount --uts --ipc --net --pid 

.. note:: *<PROJECT_FOLDER>*  are just paths on your system where your projects and extracted data are stored.
.. warning:: For Windows the *<PROJECT_FOLDER>* path must be of the form */<DRIVE_LETTER/<PATH>*. For example */C/Users/UserName/Documents/ScrapeConfigProjects*



Ubuntu
------

Running ScrapeConfig Locally
^^^^^^^^^^^^^^^^^^^^^^

**These instructions are only valid for an Ubuntu based OS**

1,Install ScrapeConfig::

    $ sudo ./provision.sh install_deps
    $ sudo ./provision.sh install_splash
    $ sudo ./provision.sh install_python_deps 


2, Compile scrapeconfig_ui::

    $ sudo npm install -g ember-cli
    $ sudo npm install -g bower
    $ cd scrapeconfig_ui
    $ npm install
    $ bower install 
    $ sudo ember build


3, Configure ScrapeConfig::

    $ sudo ./provision.sh configure_nginx
    $ sudo ./provision.sh configure_slyd
    $ sudo ./provision.sh configure_scrapyd
    $ sudo ./provision.sh migrate_django_db


4, Start ScrapeConfig::

If you want manully start ScrapeConfig, you shoud input the following commands::

    $ sudo service nginx start
    $ sudo /usr/bin/mongod --config /etc/mongodb.conf 
    $ export PYTHONPATH='/<APP_FOLDER>/scrapeconfig_server:/<APP_FOLDER>/slyd:/<APP_FOLDER>/slybot'
    $ python -m splash.server &
    $ slyd/do_slyd_start.sh &
    $ /usr/local/bin/scrapyd &
    $ celery worker -A scrapeconfig_dashboard -B -l info &
    $ scrapeconfig_server/manage.py runserver 

ScrapeConfig should now be running on port 9001 and you can access it at ``http://localhost:9001``.  Or if you want ScrapeConfig to be start from system starup, just install ScrapeConfig configration by ::

    $ sudo ./provision.sh configure_initctl 

Then reboot and enjoy. 

.. note:: <APP_FOLDER> should be the directory where you install scrapeconfig to 
