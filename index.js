module.exports = function( input ) {
	this.cacheable = true;

	var options = this.options.amdInjectLoader || {};
	var istanbul = options.istanbul === true;

	// Match AMD define and function
	var rCapture = /define\([ ]?(\[[\s\S]*?\]),[ ]?function[ ]?\(([^)]+)\)[ ]?{/;
	var matched = rCapture.exec( input );

	if ( !matched ) {
		throw new Error( "The amd-inject-loader only supports AMD files with dependencies." );
	}

	var dependencies = JSON.parse( matched[ 1 ].replace( /'/g, "\"" ) );
	var args = matched[ 2 ].trim().split( /,[ ]?/g );

	var injectorCode = [];

	// Build list of CommonJS style require statements
	dependencies.forEach( function( dep, index ) {
		var arg = args[ index ];
		if ( istanbul ) {
			injectorCode.push( "/* istanbul ignore next - the following line of code is used for dependency injection */" );
		}
		if ( !arg ) {
			injectorCode.push( "( injections && injections.hasOwnProperty(\"" + dep + "\") ) || require( \"" + dep + "\" );" );
		} else {
			injectorCode.push( "var " + arg + " = ( injections && injections.hasOwnProperty(\"" + dep + "\") ) ? injections[\"" + dep + "\"] : require( \"" + dep + "\" );" );
		}
	} );

	// Swap out define call with new injection style
	input = input.replace( rCapture, "module.exports = ( function ( injections ) { \n\t" + injectorCode.join( "\n\t" ) );

	return input;
};
