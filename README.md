ScrapeConfig
======

ScrapeConfig is a tool that allows you to visually scrape websites without any programming knowledge required. With ScrapeConfig you can annotate a web page to identify the data you wish to extract, and ScrapeConfig will understand based on these annotations how to scrape data from similar pages.

# Running ScrapeConfig

The easiest way to run ScrapeConfig is using [Docker]:

You can run ScrapeConfig using Docker & official ScrapeConfig-image by running:

    docker run -v ~/scrapeconfig_projects:/app/data/projects:rw -p 9001:9001 blue360media/scrapeconfig

You can also set up a local instance with [Docker-compose] by cloning this repo & running from the root of the folder:

    docker-compose up

For more detailed instructions, and alternatives to using Docker, see the [Installation] docs.

# Documentation

Documentation can be found from [Read the docs]. Source files can be found in the ``docs`` directory.

[Docker]: https://www.docker.com/
[Docker-compose]:https://docs.docker.com/compose
[Installation]: http://scrapeconfig.readthedocs.org/en/latest/installation.html
[Read the docs]: http://scrapeconfig.readthedocs.org/en/latest/index.html
[Scrapinghub]: https://scrapeconfig.blue360media.com/
