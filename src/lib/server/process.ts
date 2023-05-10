import { ObjectId } from 'mongodb';
let processClosed = false;
process.on('SIGINT', () => {
	processClosed = true;
});
export const processId = new ObjectId();
export { processClosed };
