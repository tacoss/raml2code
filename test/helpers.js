function wrapAssertion(fn, done) {
  try {
    fn();
    done();
  } catch (e) {
    done(e);
  }
}

module.exports = {
  wrapAssertion : wrapAssertion
}
