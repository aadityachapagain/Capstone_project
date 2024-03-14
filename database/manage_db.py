import os
import json
import pymongo

from loguru import logger
from dotenv import load_dotenv


# Load environment variables from .env file
load_dotenv()

# Now you can access the environment variables using os.getenv()
username = os.getenv("username")
password = os.getenv("password")

class compassDB:
    def __init__(self, username, password):
        self.db_client = pymongo.MongoClient(f"mongodb+srv://{username}:{password}@commpassdb.orm3ghh.mongodb.net/")
    def check_db(self,database):
        db_list = self.db_client.list_database_names()
        if database in db_list:
            return database
        return None
    def check_collection(self,**kwargs):
        if self.check_db(kwargs.get("database", None)):
            db_name = self.check_db(kwargs.get("database", None))
            if db_name and kwargs.get("collection") in self.db_client[db_name].list_collection_names():
                return True
            elif db_name and kwargs.get("collection") not in self.db_client[db_name].list_collection_names():
                logger.warning("Database {} found, however, collection {} not found!!!".format(db_name, kwargs.get("collection")))
                return False
        logger.warning(f"Database named {kwargs.get('database')} not found. Hence we cannot verify collection!!!")
        return False
    def create_collection(self,database, collection, json_data):
        new_db =self.db_client[database]
        new_col = new_db[collection]
        new_col.insert_one(json_data)
    def delete_collection(self):
        pass
    def query_collection(self):
        pass
    def sort_collection(self):
        pass
    def drop_collection(self):
        pass

class databaseCRUD:
    def __init(self):
        pass
    def insert_document(self):
        pass
    def update_document(self):
        pass
    def delete_document(self):
        pass

if __name__=="__main__":
    import json
    with open("./networkgraph_demo.json", "r") as new_file:
        abc = json.load(new_file)
    db_obj = compassDB(username="sharmaanix", password="5oYnbb9IRQ6Myu6j")
    logger.debug(db_obj.check_collection(database="compass_db", collection="network_graph"))
    logger.debug(db_obj.check_collection(database="compass_db", collection="network_graph_demo"))
    logger.debug(db_obj.check_collection(database="compass_db_demo", collection="network_graph"))
    logger.debug(db_obj.check_collection(database="compass_db_demo", collection="network_graph_demo"))
    if not db_obj.check_collection(database="compass_db", collection="network_graph"):
        logger.info("creating database and collection!!!")
        db_obj.create_collection("compass_db","network_graph",abc)
    
    #  if db_obj.check_db("compass_db"):
        # db_obj.create_collection("compass_db","network_graph",abc)