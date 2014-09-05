module.exports.helpers = function() {
  return [
    {
      name: 'debug',
      fn: function(optionalValue) {
        console.log("Current Context");
        console.log("====================");
        console.log(this);
        if (optionalValue) {
          console.log("Value");
          console.log("====================");
          console.log(optionalValue);
        }
      }
    }
  ];
};
