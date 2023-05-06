// MODULES

// INIT
const sendErrorDev = async (err, req, res) => {
	// A) API
	if (req.originalUrl.startsWith('/api')) {
		return res.status(err.statusCode).json({
			status: err.status,
			error: err,
			message: err.message,
			stack: err.stack
		});
	}

	// B) RENDERED WEBSITE
	console.error('ERROR 💥: ', err);
	return res.status(err.statusCode).render('error', {
		title: 'Error Page',
		code: err.statusCode,
		msg: `${err.message}`
	});
};


const sendErrorProd = async (err, req, res) => {
	// A) API
	if (req.originalUrl.startsWith('/api')) {
		// A) Operational, trusted error: send message to client
		if (err.isOperational) {
			return res.status(err.statusCode).json({
				status: err.status,
				message: `${err.message}`
			});
		}

		// B) Programming or other unknown error: don't leak error details
		// 1) Log error
		console.error('ERROR 💥', err);
		// 2) Send generic message
		return res.status(500).json({
			status: 'error',
			message: `Something went wrong!`
		});
	}

	// B) RENDERED WEBSITE
	// A) Operational, trusted error: send message to client
	if (err.isOperational) {
		// console.log(err);
		return res.status(err.statusCode).render('error', {
			title: 'Something went wrong!',
			msg: `${err.message}`
		});
	}

	// B) Programming or other unknown error: don't leak error details
	// 1) Log error
	console.error('ERROR 💥', err);
	// 2) Send generic message
	return res.status(err.statusCode).render('error', {
		title: 'Something went wrong!',
		msg: `Please try again later.`
	});
};

// EXPORT LOGICS
module.exports = (err, req, res, next) => {
	err.statusCode = err.statusCode || 500;
	err.status = err.status || 'fail';
	
	if (process.env.NODE_ENV === 'development') {
		sendErrorDev(err, req, res);
	} else if (process.env.NODE_ENV === 'production') {
		sendErrorProd(err, req, res);
	}
}