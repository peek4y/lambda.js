//Lambda.js
//Version: v1.0
//Author: Gautham R
(function () {
    var global = this;
    global.lambda = {};
    var protoAttach = false;
    lambda.config = {
        init: function (attachToProto) {
            protoAttach = attachToProto && attachToProto === true ? true : false;
            this.isOfTypeAttached = protoAttach;
            if (this.isOfTypeAttached) {
                lambda._setActionsToArrayPrototype.set();
            }
        },
        isOfTypeAttached: protoAttach
    };
    lambda._util = {
        mapKeyValue: function (obj) {
            var keyValue = [];
            if (!obj) lambda.exception.throwEx("obj is undefined");
            if (typeof (obj) != "object") lambda.exception.throwEx("obj must be of type object");

            for (var key in obj) {
                keyValue.push({ "key": key, "value": obj[key] });
            }
            return keyValue;
        }
    };
    lambda.exception = {
        throwEx: function (e) {
            console.log(e);
            throw e;
        }
    };
    lambda._query = {
        add: function (obj) {
            var mapKeyValue = lambda._util.mapKeyValue(obj);
            for (var i = 0; i < mapKeyValue.length; i++) {
                var conditionObj = mapKeyValue[i];
                var pushObj = {};
                pushObj[conditionObj.key] = conditionObj.value;
                this.conditions.push(pushObj);
            }
            return this;
        },
        conditions: [],
        type: {
            name: "query",
            hex: "7175657279"
        },
        isOfTypeQuery: function (obj) {
            if (!obj) {
                return false;
            }
            if (!obj.type) {
                return false;
            }
            if (obj.type) {
                var typeObj = obj.type;
                if (!typeObj) return false;
                if (typeof (typeObj) != 'object') return false;
                if (!typeObj.name || !typeObj.hex) return false;
                if (typeObj.name == "query" && typeObj.hex == "7175657279") return true;
            }
            return false;
        }
    };
    lambda.query = lambda._query;
    lambda._actions = {
        _select: function (arr, props) {
            var i = 0,
          j,
          me = this,
          arrLength,
          propLength,
          isSingleProp = false,
          resultObj = {},
          result = [];

            //Basic validations.
            if (!arr) lambda.exception.throwEx("Array is undefined");
            if (!props) props = [];
            if (!arr.hasOwnProperty("length") && typeof (arr) == 'object') lambda.exception.throwEx("'arr' parameter must be of type Array");
            if (!props.hasOwnProperty("length") && typeof (props) == 'object') lambda.exception.throwEx("'props' parameter must be of type Array");

            arrLength = arr.length;
            propLength = props.length;
            if (props.length == 1) {
                isSingleProp = true;
            }

            for (; i < arrLength; i++) {
                var item = arr[i];
                if (isSingleProp) {
                    var prop = me.first(props);
                    var propItem = item[prop];
                    if (propItem) {
                        result.push(propItem);
                    }
                }
                else {
                    resultObj = {};
                    for (j = 0; j < propLength; j++) {
                        var prop = props[j];
                        var propItem = item[prop];
                        if (propItem) {
                            resultObj[prop] = propItem;
                        }
                    }
                    result.push(resultObj);
                }
            }
            return result;
        },
        _first: function (arr) {
            //Basic validations.
            if (!arr) lambda.exception.throwEx("Array is undefined");
            if (!arr.hasOwnProperty("length") && typeof (arr) == 'object') lambda.exception.throwEx("'arr' parameter must be of type Array");
            if (arr.length > 0) {
                return arr[0];
            }
            return arr;

        },
        _where: function (arr, query) {
            var me = this;
            if (!arr) lambda.exception.throwEx("Array is undefined");
            if (!arr.hasOwnProperty("length") && typeof (arr) == 'object') lambda.exception.throwEx("'arr' parameter must be of type Array");
            if (!query) lambda.exception.throwEx("'query' is undefined");
            if (typeof (query) != "object") lambda.exception.throwEx("'query' parameter must be of type 'object'");
            var i = 0, j, arrLength = arr.length, result = [];
            var isOfTypeQuery = lambda._query.isOfTypeQuery(query);
            if (!isOfTypeQuery) {
                var keyValue = lambda.first(lambda._util.mapKeyValue(query));
                for (; i < arrLength; i++) {
                    var arrObj = arr[i];
                    if (arrObj) {
                        var key = keyValue.key;
                        var value = keyValue.value;
                        if (arrObj[key] != null && arrObj[key] != undefined && arrObj[key] == value) {
                            result.push(arrObj);
                        }
                    }
                }
            }
            else {
                //Extracting each kind of condition;
                var conditions = query.conditions;
                var conditionsLength = conditions.length;
                for (; i < conditionsLength; i++) {
                    var condition = conditions[i];
                    var mapKeyValue = lambda.first(lambda._util.mapKeyValue(condition));
                    var type = mapKeyValue.key;
                    var queryBy = mapKeyValue.value;
                    var isResultFilled = result.length > 0 ? true : false;
                    var arrContent = isResultFilled ? result : arr;
                    switch (type) {
                        case "or":
                            result = me._actions._where_or(arrContent, queryBy);
                            break;
                        case "and":
                            result = me._actions._where_and(arrContent, queryBy);
                            break;
                        case "like":
                            result = me._actions._where_like(arrContent, queryBy);
                            break;
                        default:
                            break;
                    }
                }
            }
            return result;
        },
        _where_like: function (arr, obj) {
            var tmpResult = [];
            var i = 0, j;
            var conditionkeyValue = lambda._util.mapKeyValue(obj);
            obj = lambda.first(conditionkeyValue);
            var arrLength = arr.length;
            for (; i < arrLength; i++) {
                var arrObj = arr[i];
                if (typeof obj.value != "number" && arrObj[obj.key] != null && arrObj[obj.key] != undefined && arrObj[obj.key].indexOf(obj.value) > -1) {
                    tmpResult.push(arrObj);
                }
            }
            return tmpResult;
        },
        _where_and: function (arr, obj) {
            var tmpResult = [];
            var i = 0, j;
            var conditionkeyValue = lambda._util.mapKeyValue(obj);
            var arrLength = arr.length, conditionLength = conditionkeyValue.length;
            for (; i < arrLength; i++) {
                var arrObj = arr[i];
                var isFound = false;
                var andSatisfy = true;
                for (j = 0; j < conditionLength; j++) {
                    var prop = conditionkeyValue[j];
                    if (arrObj[prop.key] != null && arrObj[prop.key] !=  undefined  && arrObj[prop.key] == prop.value) {
                        if (andSatisfy) {
                            isFound = true;
                        }
                    }
                    else {
                        isFound = false;
                        andSatisfy = false;
                    }
                }
                if (isFound) {
                    tmpResult.push(arrObj);
                }
            }
            return tmpResult;
        },
        _where_or: function (arr, obj) {
            var tmpResult = [];
            var i = 0, j;
            var conditionkeyValue = lambda._util.mapKeyValue(obj);
            var arrLength = arr.length, conditionLength = conditionkeyValue.length;
            for (; i < arrLength; i++) {
                var arrObj = arr[i];
                var isFound = false;
                for (j = 0; j < conditionLength; j++) {
                    var prop = conditionkeyValue[j];
                    if (arrObj[prop.key] != null && arrObj[prop.key] != undefined && arrObj[prop.key] == prop.value) {
                        isFound = true;
                    }
                }
                if (isFound) {
                    tmpResult.push(arrObj);
                }
            }
            return tmpResult;
        },
        _getActions: function () {
            var me = this;
            return {
                select: me._select,
                first: me._first,
                where: me._where
            };
        }
    };
    lambda._setActionsToArrayPrototype = {
        actions: {
            collection: {},
            getSelectAction: function () {
                return this.collection.select;
            },
            getFirstAction: function () {
                return this.collection.first;
            },
            getWhereAction: function () {
                return this.collection.where;
            }
        },
        set: function () {
            var actionsObj = lambda._actions._getActions();
            this.actions.collection = actionsObj;
            this._setForArraySelect();
            this._setForArrayFirst();
        },
        _setForArraySelect: function () {
            var actionsObj = this.actions;
            Array.prototype.select = function (props) {
                var me = this;
                return actionsObj.getSelectAction()(me, props);
            }
        },
        _setForArrayFirst: function () {
            var actionsObj = this.actions;
            Array.prototype.first = function () {
                var me = this;
                return actionsObj.getFirstAction()(me);
            }
        },
        _setForArrayWhere: function () {
            var actionsObj = this.actions;
            Array.prototype.where = function (query) {
                var me = this;
                return actionsObj.getWhereAction()(query);
            }
        }
    };


    var actionsList = lambda._actions._getActions();
    lambda.select = actionsList.select;
    lambda.first = actionsList.first;
    lambda.where = actionsList.where;

    if (typeof module != 'undefined') {
        module.exports = lambda;
    }
})();

