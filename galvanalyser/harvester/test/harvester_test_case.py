import unittest
import psycopg2
import os


class HarvesterTestCase(unittest.TestCase):
    DATA_DIR = '/usr/data'
    USER = 'test'
    USER_PWD = 'test'
    HARVESTER_ID = 'test_harvester'
    HARVESTER_PWD = 'test_harvester'
    DATABASE = "gtest"
    HARVESTER_INSTITUTION = 'Oxford'

    @classmethod
    def setUpClass(self):
        self.conn = psycopg2.connect(
            host="postgres",
            port=5432,
            database=self.DATABASE,
            user=self.HARVESTER_ID,
            password=self.HARVESTER_PWD,
        )

    @classmethod
    def tearDownClass(self):
        self.conn.close()
