/* eslint-disable no-console */
/**
 * @module logger
 * @param {int} priority - Logger mode.
 * @param {string} collectionName - service name.
 * @param {string} command - service command to log.
 * @param {string} content - log content.
 */
function logger(priority, collectionName, command, content) {
  // define priority based on process.env.NODE_ENV
  const logLevel = Number(process.env.SERVER_LOGGER_LEVEL) || 4;
  let fullContent;
  if (process.env.NODE_ENV === 'test' || process.env.NODE_ENV === 'development') {
    if (priority <= logLevel) {
      if (typeof content === 'object') {
        if (content instanceof Error) {
          fullContent = content;
        } else {
          fullContent = `[${collectionName.toUpperCase()}] ${command} : ${JSON.stringify(
            content,
          )}`;
        }
      } else if (typeof content !== 'object') {
        fullContent = `[${collectionName.toUpperCase()}] ${command} : ${content}`;
      }
      console.log(fullContent);
      return null;
    } else if (priority > logLevel) {
      return null;
    }
    throw new Error('INVALID_LOG, Missing argument in logger');
  }
  return null;
}

module.exports = {
  logger,
};
