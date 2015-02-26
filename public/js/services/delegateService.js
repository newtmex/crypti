require('angular');

angular.module('webApp').service('delegateService', function ($http, $filter) {

    function filterData(data, filter) {
        return $filter('filter')(data, filter)
    }

    function orderData(data, params) {
        return params.sorting() ? $filter('orderBy')(data, params.orderBy()) : filteredData;
    }

    function sliceData(data, params) {
        return data.slice((params.page() - 1) * params.count(), params.page() * params.count())
    }

    function transformData(data, filter, params) {
        return sliceData(orderData(filterData(data, filter), params), params);
    }

    var delegates = {
        cachedTOP: {data: [], time: new Date()},
        cachedStundby: {data: [], time: new Date()},
        getTopList: function ($defer, params, filter) {
            if (delegates.cachedTOP.data.length > 0 && new Date() - delegates.cachedTOP.time < 1000 * 10) {
                var filteredData = filterData(delegates.cachedTOP.data, filter);
                var transformedData = sliceData(orderData(filteredData, params), params);
                params.total(filteredData.length)
                $defer.resolve(transformedData);
            }
            else {
                $http.get("/api/delegates/", {params: {orderBy: "rate:asc", limit: 3, offset: 0}})
                    .then(function (response) {
                        angular.copy(response.data.delegates, delegates.cachedTOP.data);
                        delegates.cachedTOP.time = new Date();
                        params.total(response.data.delegates.length);
                        var filteredData = $filter('filter')(response.data.delegates, filter);
                        var transformedData = transformData(response.data.delegates, filter, params)
                        $defer.resolve(transformedData);
                    });
            }
        },
        getStandbyList: function ($defer, params, filter) {
            if (delegates.cachedStundby.data.length > 0 && new Date() - delegates.cachedStundby.time < 1000 * 10) {
                var filteredData = filterData(delegates.cachedStundby.data, filter);
                var transformedData = sliceData(orderData(filteredData, params), params);
                params.total(filteredData.length)
                $defer.resolve(transformedData);
            }
            else {
                $http.get("/api/delegates/", {params: {orderBy: "rate:asc", limit: 101, offset: 3}})
                    .then(function (response) {
                        angular.copy(response.data.delegates, delegates.cachedStundby.data);
                        delegates.cachedStundby.time = new Date();
                        params.total(response.data.delegates.length);
                        var filteredData = $filter('filter')(response.data.delegates, filter);
                        var transformedData = transformData(response.data.delegates, filter, params)
                        $defer.resolve(transformedData);
                    });
            }
        }
    };
    return delegates;
});