// #include <libpq-fe.h>
#ifndef DATABASE_H
#define DATABASE_H


// init db
void init_database();

// close connection
void close_database();

// load data
int fetch_data_from_db();

// insert data
int insert_data_to_db(const char *data);

// update data in db
int update_data_in_db(int id, const char *updated_data);

// delete data from db
int delete_data_from_db(int id);

#endif // DATABASE_H