from unittest import TestCase

from slybot.starturls import FragmentGenerator


class FragmentGeneratorTest(TestCase):
    def test_generated_url_list(self):
        github_start_urls = [
            'https://github.com/blue360media',
            'https://github.com/scrapy',
            'https://github.com/scrapy-plugins'
        ]
        url_spec = {
            'fragments': [
                {'type': 'fixed', 'value': 'https://github.com/'},
                {'type': 'list', 'value': 'blue360media scrapy scrapy-plugins'},
            ]
        }
        generator = FragmentGenerator()

        self.assertEqual(list(generator(url_spec)), github_start_urls)

    def test_generated_url_range(self):
        github_start_urls = [
            'https://github.com/0',
            'https://github.com/1',
            'https://github.com/2'
        ]
        url_spec = {
            'fragments': [
                {'type': 'fixed', 'value': 'https://github.com/'},
                {'type': 'range', 'value': '0-2'},
            ]
        }
        generator = FragmentGenerator()

        self.assertEqual(list(generator(url_spec)), github_start_urls)

    def test_mixed_fragments(self):
        donedeal_start_urls = [
            'https://www.donedeal.ie/cars-for-sale/i/1',
            'https://www.donedeal.ie/cars-for-sale/i/2',
            'https://www.donedeal.ie/houses-for-sale/i/1',
            'https://www.donedeal.ie/houses-for-sale/i/2',
            'https://www.donedeal.ie/pets-for-sale/i/1',
            'https://www.donedeal.ie/pets-for-sale/i/2',
            'https://www.donedeal.ie/kitchens-for-sale/i/1',
            'https://www.donedeal.ie/kitchens-for-sale/i/2'
        ]
        url_spec = {
            'fragments': [
                {'type': 'fixed', 'value': 'https://www.donedeal.ie/'},
                {
                    'type': 'list',
                    'value': ('cars-for-sale houses-for-sale '
                              'pets-for-sale kitchens-for-sale')
                },
                {'type': 'fixed', 'value': '/i/'},
                {'type': 'range', 'value': '1-2'},
            ]
        }
        generator = FragmentGenerator()

        self.assertEqual(list(generator(url_spec)), donedeal_start_urls)

    def test_generated_letters(self):
        github_start_urls = [
            'https://github.com/blue360media/a',
            'https://github.com/blue360media/b',
            'https://github.com/blue360media/c',
            'https://github.com/blue360media/d',
        ]
        url_spec = {
            'fragments': [
                {'type': 'fixed', 'value': 'https://github.com/blue360media/'},
                {'type': 'range', 'value': 'a-d'},
            ]
        }
        generator = FragmentGenerator()

        self.assertEqual(list(generator(url_spec)), github_start_urls)
