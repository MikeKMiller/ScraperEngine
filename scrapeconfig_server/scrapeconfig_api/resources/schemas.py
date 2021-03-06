from scrapeconfig_orm.models import Schema

from .projects import BaseProjectModelRoute
from ..jsonapi.exceptions import JsonApiBadRequestError, JsonApiNotFoundError


class SchemaRoute(BaseProjectModelRoute):
    lookup_url_kwarg = 'schema_id'
    default_model = Schema

    def get_instance(self):
        return self.get_collection()[self.kwargs.get('schema_id')]

    def get_collection(self):
        return self.project.schemas

    def get_list_kwargs(self):
        return {
            'fields_map': {
                'schemas': [
                    'name',
                    'default',
                    'project',
                ],
            }
        }

    def update(self, *args, **kwargs):
        # Reset default schema if current schema will be default
        if self.data.get('data', {}).get('attributes', {}).get('default'):
            for schema in self.get_collection():
                if schema.default:
                    schema.default = False
                schema.save()
        return super(SchemaRoute, self).update(*args, **kwargs)

    def destroy(self, *args, **kwargs):
        try:
            schema = self.get_instance()
        except KeyError:
            raise JsonApiNotFoundError('Unable to find the requested schema')
        for spider in self.project.spiders:
            for sample in spider.samples:
                for item in sample.items:
                    if self._item_uses_schema(item):
                        raise JsonApiBadRequestError(
                            'Unable to delete the data format "%s" as it is used '
                            "by a spider's sample." % schema.name)

        return super(SchemaRoute, self).destroy(*args, **kwargs)

    def _item_uses_schema(self, item):
        schema = self.get_instance()
        if item.schema.id == schema.id:
            return True
        for item in item.annotations:
            if hasattr(item, 'schema') and self._item_uses_schema(item):
                return True
        return False
