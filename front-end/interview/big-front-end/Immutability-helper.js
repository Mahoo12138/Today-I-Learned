function update(data, command) {
  Object.entries(command).forEach(([key, dataOrCommand]) => {
    if (typeof data === 'object' && key in data || (Array.isArray(data) && !isNaN(key))) {
      data[key] = update(data[key], dataOrCommand)
    } else {
      switch (key) {
        case '$push':
          data.push(...dataOrCommand);
          break;
        case '$set':
          data = dataOrCommand;
          break;
        case '$merge':
          if (typeof data === 'object') {
            data = Object.assign(data, dataOrCommand)
          } else {
            throw new Error('$merge operation must receive an object')
          }
          break;
        case '$apply':
          data = dataOrCommand(data);
          break;
        default:
          break;
      }
    }
  });
  return data;
}

