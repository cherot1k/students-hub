const specialSymbol = '$'

const addValueToTree = (tree, values, valueToAdd) => {
    if(values.length === 1) return tree[values[0]] = valueToAdd;
    return addValueToTree(tree[values[0]], values.slice(1, values.length), valueToAdd)
}

const addOrderByToIncludeObject = ({orderTree, sort, includeObject}) => {
    if(orderTree.length === 1){
        const orderObject = {
            [orderTree[0]] : sort
        }
        return {orderBy: orderObject, include: includeObject}
    }

    const includeMutable = JSON.parse(JSON.stringify(includeObject))

    addValueToTree(includeMutable, orderTree, sort)

    return {include: includeMutable}
}

const addFilterToIncludeObject = ({AND, includeObject}) => {
    if(!AND) return {defaultObject: {}, includeObject}
    const defaultObject = {where: {AND: []}};
    const includeObj = JSON.parse(JSON.stringify(includeObject));
    for(const value of AND){
        for(const keys of Object.keys(value)){
            const keyValues = keys.split('.');
            if(keyValues.length === 1){
                defaultObject.where.AND = [...defaultObject.where.AND, {[keyValues[0]]: { equals: value[keyValues[0]]}}]
                continue;
            }
            const valueToAdd = {
                [keyValues[keyValues.length - 1]]: !Object.values(value)[0].includes(specialSymbol)? {equals: Object.values(value)[0]} : {contains: Object.values(value)[0].replace('$', '')}
            }
            keyValues.pop()
            keyValues.push('where')
            addValueToTree(includeObj, keyValues, valueToAdd)
        }

    }
    return {defaultObject, includeObject: includeObj}
}

class QueryBuilder{
    buildQuery({skip, take, order, sort, AND, includeObject}){
        const paginationValues = {take, skip}

        const orderTree = order.split('.')
        const sortedObject = {
            [sort]: orderTree[orderTree.length - 1]
        }
        orderTree.pop()
        orderTree.push('orderBy')

        const {include, orderBy} = addOrderByToIncludeObject({orderTree, sort: sortedObject, includeObject})

        const {defaultObject: defaultFilter, includeObject: mutatedInclude} =
            addFilterToIncludeObject({AND, includeObject: include})

        return Object.assign({}, orderBy, defaultFilter, mutatedInclude, paginationValues)
    }


}

module.exports = {
   queryBuilder: new QueryBuilder()
}
