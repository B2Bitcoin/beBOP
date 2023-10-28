export interface Role {
	_id: string;
	name: string;

	permissions: {
		read: string[];
		write: string[];
		forbidden: string[];
	};
}
