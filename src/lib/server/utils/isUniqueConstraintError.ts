import { MongoServerError } from 'mongodb';

export function isUniqueConstraintError(error: unknown): error is MongoServerError {
	/// See https://github.com/mongodb/mongo-c-driver/blob/79c929a/src/libmongoc/src/mongoc/mongoc-error.h#L113
	// error.keyPattern & error.keyValue are also available
	return error instanceof MongoServerError && error.code === 11000;
}
