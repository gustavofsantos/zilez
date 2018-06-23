function Just(x) {
	return {
		map: f => Just(f(x))
		value: f => f(x)
	}
}

function Nothing(x) {
	return {
		map: f => Nothing(x),
		value: f => f(x)
	}
}

function Maybe(x) {
	return x? Just(x) : Nothing(null);
}

module.exports = { Maybe, Just, Nothing }