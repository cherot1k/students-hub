class DI{
    map = {}
    injectModule (key) {
        if(!this.map[key]) throw new Error('there is no module with such name')
        return this.map[key]
    }

    registerModule (key, value) {
        if(!!this.map[key]) throw new Error('such module is already exist')
        this.map[key] = value
    }

}

module.exports = new DI();
