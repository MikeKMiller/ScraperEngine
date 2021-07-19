.. _getting-started:

===============
Getting Started
===============

.. note:: If you don't have ScrapeConfig running yet, please read the :ref:`Installation guide <installation>` first. 

This tutorial will briefly cover how to begin extracting data with ScrapeConfig.

Creating a spider
=================

Let's start by creating a project. Enter a URL and ScrapeConfig will render it like below:


.. This tutorial will briefly cover how to retrieve products from Amazon.com_ using ScrapeConfig.

.. .. _amazon.com: http://amazon.com/

.. First, create a ScrapeConfig project and enter a URL. ScrapeConfig will render it like below:

.. image:: _static/scrapeconfig-main-page.png
    :alt: ScrapeConfig main page

Click the ``New spider`` button to create a new spider. ScrapeConfig will add the page's URL as a start page automatically. Start pages are used to seed the crawl and ScrapeConfig will visit them when you start the spider to find more links.

Creating a sample
=================

A sample describes how data should be extracted from the page. ScrapeConfig will use your samples to extract data from other pages with a similar structure.

ScrapeConfig works like a web browser, so you can navigate between pages as you would normally. Navigate to a page you want to scrape 	and then the ``New sample`` button to create a :ref:`sample <samples>` of the page.

.. image:: _static/scrapeconfig-new-spider.png
    :alt: Newly created sample

Now that you've created the sample, you can begin :ref:`annotating <what-are-annotations>` the page. Annotations link a piece of data in the page to an item field. You'll notice that you can highlight elements on the page, if you click on it will create a new field to which the element will be extracted. 

ScrapeConfig will create an :ref:`item <items>` schema from the elements that you annotated and will use it as the data format for the scraped :ref:`items <items>`.


.. image:: _static/scrapeconfig-annotation.png
    :alt: Annotating a page

You can see a preview of the items your sample will extract on the right. Once you've annotated all the data you wish to extract, close the sample. Your spider is :ref:`ready to run <running-spider>`, but you may want to configure it further in which case you should continue reading.


Configuring your crawler
========================

To start crawling a website, ScrapeConfig needs one or more URLs to visit first so it can gather further links to crawl. You can define these URLs on the left under ``START PAGES``.

.. image:: _static/scrapeconfig-add-start-pages.png
    :alt: Adding start pages


ScrapeConfig follows all in-domain URLs by default. In many cases you'll want to limit the pages ScrapeConfig will visit so requests aren't wasted on irrelevant pages. 

To do this, you can set follow and exclude patterns that whitelist and blacklist URLs respectively. These can be configured by changing the crawling policy to ``Configure URL patterns``. 

For example, Amazon products' URLs contain ``/gp/``, so you can add this as a follow pattern and ScrapeConfig will know to only follow such URLs.

.. image:: _static/scrapeconfig-configuring-crawling.png
    :alt: Configuring the crawling


Begin to crawl 
========================

The spider you have created is just a configration file, in order to crawl datas from site, you must deploy spider on scrapyd, which can be done by select ``Deploy project`` on the left under ``Project``. 


.. image:: _static/scrapeconfig-deploy-project.png
    :alt: Deploy the project


Once you've deployed your project, it's time to :ref:`run <running-spider>` your spider.  Check out the :ref:`examples` to learn a few tips to be more productive with ScrapeConfig.

.. image:: _static/scrapeconfig-run-spider.png
    :alt: Run a spider 


Viewing result 
========================

Crawling process can be monitored by ``JOBS`` tab on left siderbar. Like process is a running program in operating system,  job is a running spider, which can be in pending, running and finished state. When job finished, you can browse crawled items. 


.. image:: _static/scrapeconfig-jobs.png
    :alt: Dashboard jobs  


