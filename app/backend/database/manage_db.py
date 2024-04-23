import os
import json
import pymongo

from loguru import logger


class compassDB:
    def __init__(self, username, password):
        self.db_client = pymongo.MongoClient(
            f"mongodb+srv://{username}:{password}@commpassdb.orm3ghh.mongodb.net/"
        )

    def check_db(self, database):
        db_list = self.db_client.list_database_names()
        if database in db_list:
            return database
        return None

    def check_collection(self, **kwargs):
        if self.check_db(kwargs.get("database", None)):
            db_name = self.check_db(kwargs.get("database", None))
            if (
                db_name
                and kwargs.get("collection")
                in self.db_client[db_name].list_collection_names()
            ):
                return True
            elif (
                db_name
                and kwargs.get("collection")
                not in self.db_client[db_name].list_collection_names()
            ):
                logger.warning(
                    "Database {} found, however, collection {} not found!!!".format(
                        db_name, kwargs.get("collection")
                    )
                )
                return False
        logger.warning(
            f"Database named {kwargs.get('database')} not found. Hence we cannot verify collection!!!"
        )
        return False

    def add_document(self, database, collection, json_data):
        new_db = self.db_client[database]
        new_col = new_db[collection]
        new_col.insert_one(json_data)

    def query_document(self, database, collection, query):
        mongo_db = self.db_client[database]
        mongo_col = mongo_db[collection]
        logger.error(mongo_col)
        logger.warning(query)
        logger.info([idx for idx in mongo_col.find(query)])
        if [idx for idx in mongo_col.find(query)]:
            return [idx for idx in mongo_col.find(query)][0]
        return {}

    def update_document(self, **kwargs):
        mongo_db = self.db_client[kwargs.get("database")]
        mongo_col = mongo_db[kwargs.get("collection")]
        if kwargs.get("query", {}) and kwargs.get("updated_value", {}):
            mongo_col.update_one(kwargs.get("query"), kwargs.get("updated_value"))
    
    def delete_document(self, **kwargs):
        mongo_db = self.db_client[kwargs.get("database")]
        mongo_col = mongo_db[kwargs.get("collection")]
        mongo_col.delete_one(kwargs.get("query"))

