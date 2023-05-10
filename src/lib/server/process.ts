let processClosed = false;
process.on('SIGINT', () => {
	processClosed = true;
});
export { processClosed };
