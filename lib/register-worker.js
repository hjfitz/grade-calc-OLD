if ('serviceWorker' in navigator) {
	navigator.serviceWorker.register('/worker.js', {scope: '/'}).then((reg) => {
		console.log('Worker registered:', reg.scope)
	  }).catch((error) => {
		console.log('Registration failed:', error);
	})
}