import psycopg2


class InstitutionRow:
    def __init__(self, name, id_=None):
        self.id = id_
        self.name = name

    def insert(self, conn):
        with conn.cursor() as cursor:
            cursor.execute(
                (
                    "INSERT INTO experiment.institution (name) "
                    "VALUES (%s)"
                ),
                [self.name],
            )

    @staticmethod
    def select_from_id(id_, conn):
        with conn.cursor() as cursor:
            cursor.execute(
                ("SELECT name FROM experiment.institution " "WHERE id=(%s)"),
                [id_],
            )
            result = cursor.fetchone()
            if result is None:
                return None
            return InstitutionRow(id_=id_, name=result[0])

    @staticmethod
    def select_from_name(name, conn):
        with conn.cursor() as cursor:
            cursor.execute(
                ("SELECT id FROM experiment.institution " "WHERE name=(%s)"),
                [name],
            )
            result = cursor.fetchone()
            if result is None:
                return None
            return InstitutionRow(id_=result[0], name=name)
