'use strict';
define(['jquery', 'config', 'ojs/ojrouter', 'appController'], function ($, config, router, app) {
    var self = this;
    let backendHeaders = {
        "Content-Type": 'application/json',
        "Access-Control-Allow-Origin": true,
        "Access-Control-Allow-Credentials": true,
        "Access-Control-Allow-Methods": "POST,GET,PUT,DELETE"
    };
    var baseHeaders = backendHeaders;
    var localUrl = 'js/navData/';
    var isOnline = true;
    function getUrlVars() {
        var vars = [], hash;
        var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
        for (var i = 0; i < hashes.length; i++) {
            hash = hashes[i].split('=');
            vars.push(hash[0]);
            vars[hash[0]] = hash[1];
        }
        return vars;
    }

    function parseJwt() {
        try {
            // Get Token Header
            let token = backendHeaders.Authorization.substring(backendHeaders.Authorization.indexOf(' ') + 1);
            const base64HeaderUrl = token.split('.')[0];
            const base64Header = base64HeaderUrl.replace('-', '+').replace('_', '/');
            const headerData = JSON.parse(window.atob(base64Header));
            // Get Token payload and date's
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace('-', '+').replace('_', '/');
            const dataJWT = JSON.parse(window.atob(base64));
            dataJWT.header = headerData;
            return dataJWT;
        } catch (err) {
            return false;
        }
    }
    function isTokenValid() {  
        let tokenData = parseJwt();
        if (!tokenData || !tokenData.exp) {
            return false;
        } else {
            if (new Date().getTime() >= (tokenData.exp * 1000)) {
                oj.Router.rootInstance.go('logout');
                return false;
            } else {
                return true;
            }
        }
    }

    function getMainRouterMenu(sysRole) {
        if (isOnline && false)
            return $.ajax({
                type: 'GET',
                headers: baseHeaders,
                url: config.user + '/user/routes/${sysRole}',
                data: JSON.stringify(data)
            });
        else {
            return $.get(localUrl + 'routes/main/' + sysRole + '.json');
        }
    }

    function getSetupRouterMenu(sysRole) {
        if (isOnline && false)
            return $.ajax({
                type: 'GET',
                headers: baseHeaders,
                url: config.user + '/user/routes/setup/${sysRole}',
                data: JSON.stringify(data)
            });
        else {
            return $.get(localUrl + 'routes/setup/' + sysRole + '.json');
        }
    }


    function getAssetRouterMenu(sysRole) {
        if (isOnline && false)
            return $.ajax({
                type: 'GET',
                headers: baseHeaders,
                url: config.user + '/user/routes/setup/${sysRole}',
                data: JSON.stringify(data)
            });
        else {
            return $.get(localUrl + 'routes/assets/' + sysRole + '.json');
        }
    }

    function doLogin(data) {
        if (isOnline)
            return $.ajax({
                type: 'POST',
                headers: baseHeaders,
                url: config.user + '/user/auth/login',
                data: JSON.stringify(data)
            });
        else {
            return $.get(localUrl + 'users.txt');
        }
    }

function editUserProfile(email) {
        if (isOnline)
            return $.ajax({
                type: 'POST',
                headers: baseHeaders,
                url: config.user + '/user/userProfile/'+email           
            });
        else {
            return $.get(localUrl + 'users.txt');
        }
    }

    function logout(data) {
        if (isOnline)
            return $.ajax({
                type: 'POST',
                headers: baseHeaders,
                url: config.user + '/user/logout',
                data: JSON.stringify(data)
            });
        else {
            return $.get(localUrl + 'users.txt');
        }
    }

    function eulaAcceptance(data) {
        if (isOnline)
            return $.ajax({
                type: 'PUT',
                headers: baseHeaders,
                url: config.user + '/user/eula',
                data: JSON.stringify(data)
            });
        else {
            return $.get(localUrl + 'users.txt');
        }
    }

    function resetPassword(data) {
        if (isOnline)
            return $.ajax({
                type: 'POST',
                headers: baseHeaders,
                url: config.user + '/user/auth/resetPassword',
                data: JSON.stringify(data)
            });
        else {
            return $.get(localUrl + 'users.txt');
        }
    }


    function forgotPassword(data) {
        if (isOnline)
            return $.ajax({
                type: 'POST',
                headers: baseHeaders,
                url: config.user + '/user/auth/forgotPassword',
                data: JSON.stringify(data)
            });
        else {
            return $.get(localUrl + 'users.txt');
        }
    }

    function getTenantIds(username) {
        //console.log(config.user + '/user/tenant/${username}');
        //console.log(isTokenValid())

        if (isOnline)
            return $.ajax({
                type: 'GET',
                timeout: 3000, // sets timeout to 3 seconds
                headers: backendHeaders,
                url: config.user + '/user/tenant/' + username,
                // error: function (e) {
                //     return Promise.reject(e);
                // }
            });
        else {
            return $.get(localUrl + 'users.txt');
        }
    }



    /*Users*/

    function getUserList(filter, page, skip) {
        if (isOnline)
            return $.ajax({
                type: 'POST',
                headers: backendHeaders,
                url: config.user + '/user/search?&page=' + page + '&skip=' + skip,
                data: JSON.stringify(filter)
            });
        else {
            return $.get(localUrl + 'users.txt');
        }
    }

    function addUpdateUser(data, method) {
        if (isOnline)
            return $.ajax({
                type: method,
                headers: backendHeaders,
                url: config.user + '/user/addUser',
                data: data
            });
        else {
            return $.get(localUrl + 'users.txt');
        }
    }


    function regTenantAdmin(data, method) {
        if (isOnline)
            return $.ajax({
                type: method,
                headers: backendHeaders,
                url: config.user + '/user/reg',
                data: data
            });
        else {
            return $.get(localUrl + 'users.txt');
        }
    }

    function getTenantAdmins(tenantId) {
        if (isOnline)
            return $.ajax({
                type: 'GET',
                headers: backendHeaders,
                url: config.user + '/user/tenantAdmin/' + tenantId,
            });
        else {
            return $.get(localUrl + 'users.txt');
        }
    }

    function deleteUser(tenantId, email) {
        if (isOnline)
            return $.ajax({
                type: 'POST',
                headers: backendHeaders,
                url: config.user + '/user/' + tenantId + '/' + email
            });
        else {
            return $.get(localUrl + 'users.txt');
        }
    }


    function getUserTags(tenantId, email) {
        if (isOnline)
            return $.ajax({
                type: 'GET',
                headers: backendHeaders,
                url: config.user + '/user/tags/' + tenantId + '/' + email
            });
        else {
            return $.get(localUrl + 'users.txt');
        }
    }

    function updateUserTags(tenantId, email, data) {

        if (isOnline)
            return $.ajax({
                type: 'POST',
                headers: backendHeaders,
                url: config.user + '/user/tags/' + tenantId + '/' + email,
                data: data
            });
        else {
            return $.get(localUrl + 'users.txt');
        }
    }


    function getUserCount() {
        if (isOnline)
            return $.ajax({
                type: 'GET',
                headers: backendHeaders,
                url: config.user + '/user/count'
            });
        else {
            return $.get(localUrl + 'users.txt');
        }
    }


    function refreshToken(tenantId) {
        if (isOnline)
            return $.ajax({
                type: 'GET',
                timeout: 3000, // sets timeout to 3 seconds
                headers: baseHeaders,
                url: config.user + '/user/refresh/' + tenantId,
                error: function (e) {
                    return Promise.reject(e);
                }
            });
        else {
            return $.get(localUrl + 'users.txt');
        }
    }





    /**Tenants***/
    function getTenantList(filter, page, skip) {

        if (isOnline) {
            return $.ajax({
                type: 'POST',
                headers: backendHeaders,
                url: config.tenant + '/tenant/search?&page=' + page + '&skip=' + skip,
                data: JSON.stringify(filter)
            });
        } else {
            return $.get(localUrl + 'users.txt');
        }
    }

    function addUpdateTenant(data, method) {
        let tokenValid = isTokenValid();
        if (isOnline)
            return $.ajax({
                type: method,
                headers: backendHeaders,
                url: config.tenant + '/tenant/addTenant',
                data: data
            });
        else {
            return $.get(localUrl + 'users.txt');
        }
    }

    function getTenant(tenant) {
        let tokenValid = isTokenValid();
        if (isOnline)
            return $.ajax({
                type: 'GET',
                headers: backendHeaders,
                url: config.tenant + '/tenant' + tenant,
            });
        else {
            return $.get(localUrl + 'users.txt');
        }
    }



    function deleteTenant(tenantId) {
        if (isOnline)
            return $.ajax({
                type: 'POST',
                headers: backendHeaders,
                url: config.tenant + '/tenant/' + tenantId
            });
        else {
            return $.get(localUrl + 'users.txt');
        }
    }



    function getTenantTags(tenantId) {
        let tokenValid = isTokenValid();
        if (isOnline)
            return $.ajax({
                type: 'GET',
                headers: backendHeaders,
                url: config.tenant + '/tenant/tags/' + tenantId
            });
        else {
            return $.get(localUrl + 'users.txt');
        }
    }

    function updateTenantTags(tenantId, data) {
        let tokenValid = isTokenValid();
        if (isOnline)
            return $.ajax({
                type: 'POST',
                headers: backendHeaders,
                url: config.tenant + '/tenant/tags/' + tenantId,
                data: data
            });
        else {
            return $.get(localUrl + 'users.txt');
        }
    }

    function getSubTenants(tenantId, data) {
        let tokenValid = isTokenValid();
        if (isOnline)
            return $.ajax({
                type: 'GET',
                headers: backendHeaders,
                url: config.tenant + '/tenant/subTenant/' + tenantId,
            });
        else {
            return $.get(localUrl + 'users.txt');
        }
    }

    function putSubTenants(data) {
        let tokenValid = isTokenValid();
        if (isOnline)
            return $.ajax({
                type: 'PUT',
                headers: backendHeaders,
                url: config.tenant + '/tenant/subTenant/' + data.tenantId,
                data: JSON.stringify(data)
            });
        else {
            return $.get(localUrl + 'users.txt');
        }
    }

    function putUserTenants(data) {
        let tokenValid = isTokenValid();
        if (isOnline)
            return $.ajax({
                type: 'PUT',
                headers: backendHeaders,
                url: config.user + '/user/tenant/' + data.email,
                data: JSON.stringify(data)
            });
        else {
            return $.get(localUrl + 'users.txt');
        }
    }

    /*Location*/
    function getLocList(filter) {
        if (isOnline)
            return $.ajax({
                type: 'POST',
                headers: backendHeaders,
                url: config.location + '/location/search',
                data: JSON.stringify(filter)
            });
        else {
            return $.get(localUrl + 'users.txt');
        }
    }

    function addUpdateLoc(data, method) {
        if (isOnline) {
            return $.ajax({
                type: method,
                headers: backendHeaders,
                url: config.location + '/location/addLocation',
                data: data
            });
        } else {
            return $.get(localUrl + 'users.txt');
        }
    }


    function addUpdateLocConfig(data, method) {
        if (isOnline) {
            return $.ajax({
                type: method,
                headers: backendHeaders,
                url: config.location + '/location/levelConfig',
                data: data
            });
        } else {
            return $.get(localUrl + 'users.txt');
        }
    }

    function getLocConfig(tenantId) {
        if (isOnline) {
            return $.ajax({
                type: 'GET',
                headers: backendHeaders,
                url: config.location + '/location/levelConfig/' + tenantId
            });
        } else {
            return $.get(localUrl + 'users.txt');
        }
    }





    function getLocTags(locId) {
        if (isOnline)
            return $.ajax({
                type: 'GET',
                headers: backendHeaders,
                url: config.location + '/location/tags/' + locId
            });
        else {
            return $.get(localUrl + 'users.txt');
        }
    }

    function updateLocTags(locId, data) {
        if (isOnline)
            return $.ajax({
                type: 'POST',
                headers: backendHeaders,
                url: config.location + '/location/tags/' + locId,
                data: data
            });
        else {
            return $.get(localUrl + 'users.txt');
        }
    }


    function getLocCount() {
        if (isOnline)
            return $.ajax({
                type: 'GET',
                headers: backendHeaders,
                url: config.location + '/location/count'
            });
        else {
            return $.get(localUrl + 'users.txt');
        }
    }

    function deleteLoc(locId) {

        if (isOnline)
            return $.ajax({
                type: 'POST',
                headers: backendHeaders,
                url: config.location + '/location/' + locId,
                //  data: "locId=" + locId
            });
        else {
            return $.get(localUrl + 'users.txt');
        }
    }


    /*Asset*/
    function getAssetList(filter, page, skip) {
        if (isOnline)
            return $.ajax({
                type: 'POST',
                headers: backendHeaders,
                url: config.asset + '/asset/search?&page=' + page + '&skip=' + skip,
                data: JSON.stringify(filter)
            });
        else {
            return $.get(localUrl + 'users.txt');
        }
    }


    function getAsset(assetId) {
        if (isOnline)
            return $.ajax({
                type: 'GET',
                headers: backendHeaders,
                url: config.asset + '/asset/' + assetId
            });
        else {
            return $.get(localUrl + 'users.txt');
        }
    }



    function getAssetDevice(assetId) {
        if (isOnline)
            return $.ajax({
                type: 'GET',
                headers: backendHeaders,
                url: config.asset + '/asset/deviceList/' + assetId
            });
        else {
            return $.get(localUrl + 'users.txt');
        }
    }

    function getDeviceDetails(did) {
        if (isOnline)
            return $.ajax({
                type: 'GET',
                headers: backendHeaders,
                url: config.liftdb + '/portal/devDet/get/' + did
            });
        else {
            return $.get(localUrl + 'users.txt');
        }
    }

    function addUpdateAsset(data, method) {
        if (isOnline) {
            return $.ajax({
                type: method,
                headers: backendHeaders,
                url: config.asset + '/asset/',
                data: data
            });
        } else {
            return $.get(localUrl + 'users.txt');
        }
    }


    function addUpdateAssetConfig(data, method) {
        if (isOnline) {
            return $.ajax({
                type: method,
                headers: backendHeaders,
                url: config.asset + '/asset/levelConfig',
                data: data
            });
        } else {
            return $.get(localUrl + 'users.txt');
        }
    }

    function getAssetConfig(tenantId) {
        if (isOnline) {
            return $.ajax({
                type: 'GET',
                headers: backendHeaders,
                url: config.asset + '/asset/levelConfig/' + tenantId
            });
        } else {
            return $.get(localUrl + 'users.txt');
        }
    }


    function deleteAsset(asset) {

        if (isOnline)
            return $.ajax({
                type: 'POST',
                headers: backendHeaders,
                url: config.asset + '/asset/' + asset
                //  data: "locId=" + locId
            });
        else {
            return $.get(localUrl + 'users.txt');
        }
    }


    function getAssetTags(locId) {
        if (isOnline)
            return $.ajax({
                type: 'GET',
                headers: backendHeaders,
                url: config.asset + '/asset/tags/' + locId
            });
        else {
            return $.get(localUrl + 'users.txt');
        }
    }

    function updateAssetTags(locId, data) {
        if (isOnline)
            return $.ajax({
                type: 'POST',
                headers: backendHeaders,
                url: config.asset + '/asset/tags/' + locId,
                data: data
            });
        else {
            return $.get(localUrl + 'users.txt');
        }
    }


    function getAssetDevices(assetId) {
        if (isOnline)
            return $.ajax({
                type: 'GET',
                headers: backendHeaders,
                url: config.asset + '/asset/devices/' + assetId
            });
        else {
            return $.get(localUrl + 'users.txt');
        }
    }

    function getAssetTypeCount() {
        if (isOnline)
            return $.ajax({
                type: 'GET',
                headers: backendHeaders,
                url: config.asset + '/asset/type/count'
            });
        else {
            return $.get(localUrl + 'users.txt');
        }
    }


    function regsiterAssetDevice(data, assetId) {
        if (isOnline)
            return $.ajax({
                type: 'POST',
                headers: backendHeaders,
                url: config.asset + '/asset/device/' + assetId,
                data: JSON.stringify(data)
            });
        else {
            return $.get(localUrl + 'users.txt');
        }
    }

    function deRegsiterAssetDevice(assetId, deviceId) {
        if (isOnline)
            return $.ajax({
                type: 'POST',
                headers: backendHeaders,
                url: config.asset + '/asset/device/' + assetId + '/' + deviceId
            });
        else {
            return $.get(localUrl + 'users.txt');
        }
    }

    function getDeviceAssets(assetId) {
        if (isOnline)
            return $.ajax({
                type: 'GET',
                headers: backendHeaders,
                url: config.asset + '/asset/device/' + assetId
            });
        else {
            return $.get(localUrl + 'users.txt');
        }
    }


    /***********************/
    /*Asset Type*/
    /***********************/
    function getAssetTypeList(filter) {
        if (isOnline)
            return $.ajax({
                type: 'POST',
                headers: backendHeaders,
                url: config.asset + '/asset/assetType/search',
                data: JSON.stringify(filter)
            });
        else {
            return $.get(localUrl + 'users.txt');
        }
    }

    function addUpdateAssetType(data, method) {
        if (isOnline) {
            return $.ajax({
                type: method,
                headers: backendHeaders,
                url: config.asset + '/asset/assetType',
                data: data
            });
        } else {
            return $.get(localUrl + 'users.txt');
        }
    }


    function deleteAssetType(assetType) {
        if (isOnline)
            return $.ajax({
                type: 'POST',
                headers: backendHeaders,
                url: config.asset + '/asset/assetType/' + assetType,
                //  data: "locId=" + locId
            });
        else {
            return $.get(localUrl + 'users.txt');
        }
    }
    /***********************/
    /*Asset Model*/
    /***********************/
    function getAssetModelList(filter) {
        if (isOnline)
            return $.ajax({
                type: 'POST',
                headers: backendHeaders,
                url: config.asset + '/asset/assetModel/search',
                data: JSON.stringify(filter)
            });
        else {
            return $.get(localUrl + 'users.txt');
        }
    }

    function addUpdateAssetModel(data, method) {
        if (isOnline) {
            return $.ajax({
                type: method,
                headers: backendHeaders,
                url: config.asset + '/asset/assetModel/addAssetModel',
                data: data
            });
        } else {
            return $.get(localUrl + 'users.txt');
        }
    }


    function deleteAssetModel(assetType, assetModel) {
        if (isOnline)
            return $.ajax({
                type: 'POST',
                headers: backendHeaders,
                url: config.asset + '/asset/assetModel/' + assetType + '/' + assetModel,
                //  data: "locId=" + locId
            });
        else {
            return $.get(localUrl + 'users.txt');
        }
    }


    /*device*/

    /*device*/

    function getDeviceList(filter) {
        if (isOnline) {
            return $.ajax({
                type: 'POST',
                headers: backendHeaders,
                url: config.device + '/device/search',
                data: JSON.stringify(filter)
            });
        } else {
            return $.get(localUrl + 'users.txt');
        }
    }

    function getActiveDeviceList() {
        if (isOnline)
            return $.ajax({
                type: 'GET',
                headers: backendHeaders,
                url: config.device + '/device/getactivedevices'
            });
        else {
            return $.get(localUrl + 'users.txt');
        }
    }


    function updateDeviceStatus(status, payload) {
        let url;
        if (isOnline) {
            if (status === "true") {
                url = config.device + "/device/deactivate";
            } else if (status === "false") {
                url = config.device + "/device/activate";
            }

            return $.ajax({
                type: 'POST',
                headers: backendHeaders,
                url: url,
                data: payload
            });
        } else {
            return $.get(localUrl + 'users.txt');
        }
    }


    function getDeviceCertificate(tenantId, device) {
        if (isOnline) {
            return $.ajax({
                type: 'GET',
                headers: backendHeaders,
                url: config.device + '/device/getdevicecertificate/' + tenantId + "/" + device
            });
        } else {
            return $.get(localUrl + 'users.txt');
        }
    }


    function addUpdateDevice(data, method, deviceName) {
        var param = "";
        if (method == "PUT")
            param = config.device + '/device/' + deviceName;
        else
            param = config.device + '/device'
        if (isOnline) {

            return $.ajax({
                type: method,
                headers: backendHeaders,
                url: param,
                data: data
            });
        } else {
            return $.get(localUrl + 'users.txt');
        }
    }


    function linkDevice(data, devId) {
        if (isOnline) {
            return $.ajax({
                type: 'POST',
                headers: backendHeaders,
                url: config.liftdb + '/portal/devDet/dev/' + devId,
                data: data
            });
        } else {
            return $.get(localUrl + 'users.txt');
        }
    }

    function deleteDevice(device) {
        if (isOnline)
            return $.ajax({
                type: 'DELETE',
                headers: backendHeaders,
                url: config.device + '/device/' + device
            });
        else {
            return $.get(localUrl + 'users.txt');
        }
    }

    function updateDeviceShadow(filter) {
        if (isOnline)
            return $.ajax({
                type: 'POST',
                headers: backendHeaders,
                url: config.device + '/device/updatedeviceShadow',
                data: filter
            });
        else {
            return $.get(localUrl + 'users.txt');
        }
    }

    function getImageList(filter) {
        if (isOnline) {
            return $.ajax({
                type: 'POST',
                headers: backendHeaders,
                url: config.device + '/device/ota/getImage',
                data: JSON.stringify(filter)
            });
        } else {
            return $.get(localUrl + 'users.txt');
        }
    }

    function uploadImage(formData, hdrData) {
        let imgHeader = {};
        imgHeader.description = hdrData.description;
        imgHeader.version = hdrData.version;
        imgHeader.type = hdrData.type;
        imgHeader.Authorization = backendHeaders.Authorization;
        if (isOnline) {
            return $.ajax({
                type: "POST",
                headers: imgHeader,
                url: config.device + '/device/ota/uploadImage',
                async: true,
                data: formData,
                cache: false,
                contentType: false,
                processData: false,
                timeout: 60000
            });
        } else {
            return $.get(localUrl + 'users.txt');
        }
    }

    function getOtaJobList(filter) {
        if (isOnline) {
            return $.ajax({
                type: 'POST',
                headers: backendHeaders,
                url: config.device + '/device/ota/getjob',
                data: JSON.stringify(filter)
            });
        } else {
            return $.get(localUrl + 'users.txt');
        }
    }

    function createOtaJob(payload) {
        if (isOnline)
            return $.ajax({
                type: 'POST',
                headers: backendHeaders,
                url: config.device + '/device/ota/createJob',
                data: payload
            });
        else {
            return $.get(localUrl + 'users.txt');
        }
    }


    /***********************/
    /*Device Type*/
    /***********************/
    function getDeviceTypeList(filter) {
        if (isOnline)
            return $.ajax({
                type: 'POST',
                headers: backendHeaders,
                url: config.device + '/deviceType/search',
                data: JSON.stringify(filter)
            });
        else {
            return $.get(localUrl + 'users.txt');
        }
    }

    function addUpdateDeviceType(data, method) {
        if (isOnline) {
            return $.ajax({
                type: method,
                headers: backendHeaders,
                url: config.device + '/deviceType',
                data: data
            });
        } else {
            return $.get(localUrl + 'users.txt');
        }
    }


    function deleteDeviceType(deviceType) {
        if (isOnline)
            return $.ajax({
                type: 'DELETE',
                headers: backendHeaders,
                url: config.device + '/deviceType/' + deviceType,
                //  data: "locId=" + locId
            });
        else {
            return $.get(localUrl + 'users.txt');
        }
    }



    function fetchData(url) {
        if (isOnline)
            return $.ajax({
                type: 'GET',
                headers: backendHeaders,
                url: url
            });
        else {
            return $.get(localUrl + 'users.txt');
        }
    }

    function postData(url, method, payload) {
        if (isOnline)
            return $.ajax({
                type: method,
                headers: backendHeaders,
                url: url,
                data: payload
            });
        else {
            return $.get(localUrl + 'users.txt');
        }
    }

    function getAssetDBSummary(data, type) {
        if (isOnline)
            return $.ajax({
                type: 'POST',
                headers: baseHeaders,
                url: config.assetdb + '/assetdb/${type}/summary',
                data: JSON.stringify(data)
            });
        else {
            return $.get(localUrl + 'users.txt');
        }
    }

    function getLiftSummary(data, type) {
        if (isOnline)
            return $.ajax({
                type: 'POST',
                headers: baseHeaders,
                url: config.liftdb + '/portal/liftdb/summary/' + type,
                data: JSON.stringify(data)
            });
        else {
            return $.get(localUrl + 'users.txt');
        }
    }

    //Charts Data

    /*Energy Details Chart API Integration*/
    function getEnergyDetails(device, start, end) {
        if (isOnline) {
            return $.ajax({
                type: 'GET',
                headers: baseHeaders,
                url: config.liftdb + '/portal/nilm/energyDtl?&fromTs=' + start + '&toTs=' + end + '&deviceId=' + device
                // data: JSON.stringify(data)              
            });
        } else {
            return $.get(localUrl + 'users.txt');
        }
    }

    function getLiftHeartBeat(device, start, end) {
        if (isOnline) {
            return $.ajax({
                type: 'GET',
                headers: baseHeaders,
                url: config.liftdb + '/portal/nilm/liftHeartBeat?&fromTs=' + start + '&toTs=' + end + '&deviceId=' + device
                // data: JSON.stringify(data)              
            });
        } else {
            return $.get(localUrl + 'users.txt');
        }
    }

    /*Mileage Details Chart API Integration*/
    function getMileageDetails(device, start, end, devType) {
        if (isOnline) {
            return $.ajax({
                type: 'GET',
                headers: baseHeaders,
                url: config.liftdb + '/portal/' + devType + '/mileageDtl?&fromTs=' + start + '&toTs=' + end + '&deviceId=' + device
            });
        } else {
            return $.get(localUrl + 'users.txt');
        }
    }


    /*State Details Chart API Integration*/
    function getEscStateDetails(device, start, end, devType) {
        if (isOnline) {
            return $.ajax({
                type: 'GET',
                headers: baseHeaders,
                url: config.liftdb + '/portal/' + devType + '/escStateDtl?&fromTs=' + start + '&toTs=' + end + '&deviceId=' + device
            });
        } else {
            return $.get(localUrl + 'users.txt');
        }
    }



    /*Door Cycle Details Chart API Integration*/
    function getDoorCycleDetails(device, start, end, devType) {
        if (isOnline) {

            return $.ajax({
                type: 'GET',
                headers: baseHeaders,
                // url: config.liftdb + '/portal/${devType}/doorcycleDtl?&fromTs=${start}&toTs=${end}&deviceId=${device}'
                url: config.liftdb + '/portal/' + devType + '/doorcycleDtl?&fromTs=' + start + '&toTs=' + end + '&deviceId=' + device
                // data: JSON.stringify(data)              
            });
        } else {
            return $.get(localUrl + 'users.txt');
        }
    }

    /*Door Cycle Details Chart API Integration*/
    function getRawEnergyDetails(device, start, end, attr) {
        if (isOnline) {

            return $.ajax({
                type: 'GET',
                headers: baseHeaders,
                url: config.liftdb + '/portal/nilm/rawEnergyDtl?&fromTs=' + start + '&toTs=' + end + '&deviceId=' + device + '&attr=' + attr
                // data: JSON.stringify(data)              
            });
        } else {
            return $.get(localUrl + 'users.txt');
        }
    }


    /*******************/
    /*Movement Charts*/
    /*******************/

    /*Max Speed*/
    function getMaxSpeedDetailsMMU(device, start, end) {
        if (isOnline) {

            return $.ajax({
                type: 'GET',
                headers: baseHeaders,
                url: config.liftdb + '/portal/mmu/mvmt/summary?fromTs=' + start + '&toTs=' + end + '&deviceId=' + device + '&type=' + 'ms'

            });
        } else {
            return $.get(localUrl + 'users.txt');
        }
    }

    /*Max Acceleration*/
    function getMaxAccelerationDetailsMMU(device, start, end) {
        if (isOnline) {

            return $.ajax({
                type: 'GET',
                headers: baseHeaders,
                url: config.liftdb + '/portal/mmu/mvmt/summary?fromTs=' + start + '&toTs=' + end + '&deviceId=' + device + '&type=' + 'ma'
                // data: JSON.stringify(data)              
            });
        } else {
            return $.get(localUrl + 'users.txt');
        }
    }

    /*Max Deceleration*/
    function getMaxDecelerationDetailsMMU(device, start, end) {
        if (isOnline) {

            return $.ajax({
                type: 'GET',
                headers: baseHeaders,
                url: config.liftdb + '/portal/mmu/mvmt/summary?fromTs=' + start + '&toTs=' + end + '&deviceId=' + device + '&type=' + 'md'
                // data: JSON.stringify(data)              
            });
        } else {
            return $.get(localUrl + 'users.txt');
        }
    }

    /*Tilt*/
    function getTiltDetailsMMU(device, start, end) {
        if (isOnline) {

            return $.ajax({
                type: 'GET',
                headers: baseHeaders,
                url: config.liftdb + '/portal/mmu/tiltDtl?fromTs=' + start + '&toTs=' + end + '&deviceId=' + device + '&type=' + 'ms'
                // data: JSON.stringify(data)              
            });
        } else {
            return $.get(localUrl + 'users.txt');
        }
    }

    function getActiveHoursDetails(device, start, end) {
        if (isOnline) {

            return $.ajax({
                type: 'GET',
                headers: baseHeaders,
                url: config.liftdb + '/portal/mmu/activehrsDtl?&fromTs=' + start + '&toTs=' + end + '&deviceId=' + device
                // data: JSON.stringify(data)              
            });
        } else {
            return $.get(localUrl + 'users.txt');
        }
    }



    /***********************/
    /*Training Data*/
    /***********************/
    function getDeviceLogs(deviceId, fromts, tots) {

        if (isOnline) {
            return $.ajax({
                type: 'GET',
                xhrFields: {
                    responseType: 'blob'
                },
                processData: false,
                headers: backendHeaders,
                url: config.training + '/training/download?deviceid=' + deviceId + '&frmts=' + fromts + '&tots=' + tots

            });
        } else {
            return $.get(localUrl + 'users.txt');
        }
    }

    /***********************/
    /*Alerts Data*/
    /***********************/

    /*Get Alert List*/
    function getAlertList(filterData, page, skip) {
        if (isOnline)
            return $.ajax({
                type: 'POST',
                headers: backendHeaders,
                url: config.alerts + '/alerts/search?' + '&page=' + page + '&skip=' + skip,
                data: JSON.stringify(filterData)
            });
        else {
            return $.get(localUrl + 'users.txt');
        }
    }

    /*Get Alert List*/
    function addAlertComment(data) {
        if (isOnline)
            return $.ajax({
                type: 'POST',
                headers: backendHeaders,
                url: config.alerts + '/alerts/updateComment',
                data: JSON.stringify(data)
            });
        else {
            return $.get(localUrl + 'users.txt');
        }
    }

    function getAlertStatusData(fromts, tots) {
        // console.log('fromTs=' + fromts + '&toTs=' + tots)
        if (isOnline) {
            return $.ajax({
                type: 'GET',
                headers: baseHeaders,
                url: config.alerts + '/alerts/status?&fromTs=' + fromts + '&toTs=' + tots
            });
        } else {
            return $.get(localUrl + 'users.txt');
        }
    }

    function getAlertPrioData() {
        //console.log(config.alerts + 'alerts/prio')
        if (isOnline) {
            return $.ajax({
                type: 'GET',
                headers: baseHeaders,
                url: config.alerts + '/alerts/prio'
            });
        } else {
            return $.get(localUrl + 'users.txt');
        }
    }

    /*Floor Frequency Details Chart API Integration*/
    function getFloorFrequencyDetails(device, start, end) {
        if (isOnline) {
            //console.log("Start" + start + "End" + end);
            return $.ajax({
                type: 'GET',
                headers: baseHeaders,
                //url: config.liftdb + '/mmu/flrtrans?fromTs=' + start + '&toTs=' + end + '&deviceId=' +device
                url: config.liftdb + '/portal/mmu/flrtrans/eachFloorStoppage?fromTime=' + start + '&toTime=' + end + '&deviceId=' + device
                // url: config.liftdb + '/mmu/flrtrans/floorWiseMetrics?fromTime=' + start + '&toTime=' + end + '&deviceId=' +device
                // data: JSON.stringify(data)              
            });
        } else {
            return $.get(localUrl + 'users.txt');
        }
    }

    /*Floor Transition Details Chart API Integration*/
    function getFloorTansitionDetails(device, start, end) {
        if (isOnline) {
            //console.log("Start" + start + "End" + end);
            return $.ajax({
                type: 'GET',
                headers: baseHeaders,
                url: config.liftdb + '/portal/mmu/flrtrans/floorMovement?fromTime=' + start + '&toTime=' + end + '&deviceId=' + device
                // data: JSON.stringify(data)              
            });
        } else {
            return $.get(localUrl + 'users.txt');
        }
    }


    /*Floor Velocity Details Chart API Integration*/
    function getfloorVelocityDetails(device, start, end) {
        if (isOnline) {
            //console.log("Start" + start + "End" + end);
            return $.ajax({
                type: 'GET',
                headers: baseHeaders,
                //url: config.liftdb + '/mmu/flrvelocity?fromTs=' + start + '&toTs=' + end + '&deviceId=' +device
                url: config.liftdb + '/portal/mmu/flrtrans/floorWiseMetrics?fromTime=' + start + '&toTime=' + end + '&deviceId=' + device

                // data: JSON.stringify(data)              
            });
        } else {
            return $.get(localUrl + 'users.txt');
        }
    }

    /*Overall Velocity Details Chart API Integration*/
    function getAssetVelocityDetails(device, start, end) {
        if (isOnline) {
            // console.log("Start" + start + "End" + end);
            return $.ajax({
                type: 'GET',
                headers: baseHeaders,
                url: config.liftdb + '/portal/mmu/velocity?fromTs=' + start + '&toTs=' + end + '&deviceId=' + device
                // data: JSON.stringify(data)              
            });
        } else {
            return $.get(localUrl + 'users.txt');
        }
    }

    /*Power Details Chart API Integration*/
    function getPowerDetails(device, start, end) {
        if (isOnline) {
            //console.log("Start" + start + "End" + end);
            return $.ajax({
                type: 'GET',
                headers: baseHeaders,
                url: config.liftdb + '/portal/nilm/energyDtl?&fromTs=' + start + '&toTs=' + end + '&deviceId=' + device
                // data: JSON.stringify(data)              
            });
        } else {
            return $.get(localUrl + 'users.txt');
        }
    }

    //New Dashboard

    //Get the Metrics Tile Details about Asset Summary
    function getDBMetric() {
        if (isOnline)
            return $.ajax({
                type: 'GET',
                headers: backendHeaders,
                url: config.portal + '/portal/db/dbMetric',
                error: function (e) {
                    return Promise.reject(e);
                }
            });
        else {
            return $.get(localUrl + 'users.txt');
        }
    }

    function getDBOnlineStat() {
        if (isOnline)
            return $.ajax({
                type: 'GET',
                headers: backendHeaders,
                url: config.portal + '/portal/db/onlineStat',
                error: function (e) {
                    return Promise.reject(e);
                }
            });
        else {
            return $.get(localUrl + 'users.txt');
        }
    }


    function getDBAvgMetric(fromTs, toTs) {
        if (isOnline)
            return $.ajax({
                type: 'GET',
                headers: backendHeaders,
                url: config.portal + '/portal/db/avgMetric?&fromTs=' + fromTs + '&toTs=' + toTs,
                error: function (e) {
                    return Promise.reject(e);
                }
            });
        else {
            return $.get(localUrl + 'users.txt');
        }
    }

    function getDBAssets() {
        if (isOnline)
            return $.ajax({
                type: 'GET',
                headers: backendHeaders,
                url: config.portal + '/portal/db/dbAssets',
                error: function (e) {
                    return Promise.reject(e);
                }
            });
        else {
            return $.get(localUrl + 'users.txt');
        }
    }


    function getAssetDet(assetId) {
        isTokenValid()
        if (isOnline)
            return $.ajax({
                type: 'GET',
                headers: backendHeaders,
                url: config.portal + '/portal/db/dbAssetDet?&assetId=' + assetId,
                error: function (e) {
                    return Promise.reject(e);
                }
            });
        else {
            return $.get(localUrl + 'users.txt');
        }
    }



    function getDBAssetMap() {
        isTokenValid()
        if (isOnline)
            return $.ajax({
                type: 'GET',
                headers: backendHeaders,
                url: config.portal + '/portal/db/dbAssetMap',
                error: function (e) {
                    return Promise.reject(e);
                }
            });
        else {
            return $.get(localUrl + 'users.txt');
        }
    }

    //Asset Monitoring Portal API's
    //Get Asset Tree
    function getAssetLocTree() {
        isTokenValid();
        if (isOnline)
            return $.ajax({
                type: 'GET',
                headers: backendHeaders,
                url: config.portal + '/portal/assetMon/assetLocTree',
                error: function (e) {
                    return Promise.reject(e);
                }
            });
        else {
            return $.get(localUrl + 'users.txt');
        }
    }

    //Save Asset Tree
    function saveAssetList(data, tenantId) {
        let tokenValid = isTokenValid();
        if (isOnline)
            return $.ajax({
                type: 'PUT',
                headers: backendHeaders,
                url: config.portal + '/portal/assetMon/assetLocTree/asset/' + tenantId,
                data: JSON.stringify(data)
            });
        else {
            return $.get(localUrl + 'users.txt');
        }
    }


    //Get Saved Asset List
    function getAssetListTree(tenantId) {
        if (isOnline) {
            return $.ajax({
                type: 'GET',
                headers: baseHeaders,
                url: config.portal + '/portal/assetMon/assetLocTree/assetList/' + tenantId
            });
        } else {
            return $.get(localUrl + 'users.txt');
        }
    }

    //alert Configuration
    function addAlertRule(data, method, alertName) {
        console.log("disable");
        let urlparams;
        console.log(method);
        if (method == "POST") {
            urlparams = "/alerts/rule"
        } else if (method == "PUT") {
            urlparams = "/alerts/rule/" + alertName
        }
        if (isOnline)
            return $.ajax({
                type: method,
                headers: baseHeaders,
                url: config.alerts + urlparams,
                data: JSON.stringify(data),
            });
    }

    function getAlertRules() {
        if (isOnline)
            return $.ajax({
                type: 'GET',
                headers: baseHeaders,
                url: config.alerts + '/alerts/rule',
            });
    }

    function deleteAlertRule(alertName) {

        if (isOnline)
            return $.ajax({
                type: 'POST',
                headers: backendHeaders,
                url: config.alerts + '/alerts/rule/' + alertName,
            });
        else {
            return $.get(localUrl + 'users.txt');
        }
    }


    return {
        doLogin: doLogin,
        resetPassword: resetPassword,
        forgotPassword: forgotPassword,
        eulaAcceptance: eulaAcceptance,
        logout: logout,
 	editUserProfile:editUserProfile,
        /*Routes*/
        getRouterMenu: getMainRouterMenu,
        getSetupRouterMenu: getSetupRouterMenu,
        getAssetRouterMenu: getAssetRouterMenu,
        getTenantIds: getTenantIds,
        headers: backendHeaders,
        getUrlVars: getUrlVars,
        getUserList: getUserList,
        getUserTags: getUserTags,
        updateUserTags: updateUserTags,
        addUpdateUser: addUpdateUser,
        deleteUser: deleteUser,
        getUserCount: getUserCount,
        refreshToken: refreshToken,
        regTenantAdmin: regTenantAdmin,
        getTenantAdmins: getTenantAdmins,
        getTenantList: getTenantList,
        getTenant: getTenant,
        addUpdateTenant: addUpdateTenant,
        deleteTenant: deleteTenant,
        getTenantTags: getTenantTags,
        updateTenantTags: updateTenantTags,
        getSubTenants: getSubTenants,
        putSubTenants: putSubTenants,
        putUserTenants: putUserTenants,
        getLocList: getLocList,
        addUpdateLoc: addUpdateLoc,
        addUpdateLocConfig: addUpdateLocConfig,
        getLocConfig: getLocConfig,
        getLocTags: getLocTags,
        updateLocTags: updateLocTags,
        getLocCount: getLocCount,
        deleteLoc: deleteLoc,
        //getDeviceCertificate: getDeviceCertificate,

        deleteDevice: deleteDevice,
        //Asset Config 
        addUpdateAssetConfig: addUpdateAssetConfig,
        getAssetConfig: getAssetConfig,
        //Assets
        getAssetList: getAssetList,
        getAsset: getAsset,
        addUpdateAsset: addUpdateAsset,
        deleteAsset: deleteAsset,
        getAssetTags: getAssetTags,
        updateAssetTags: updateAssetTags,
        getAssetDevices: getAssetDevices,
        regsiterAssetDevice: regsiterAssetDevice,
        deRegsiterAssetDevice: deRegsiterAssetDevice,
        getDeviceAssets: getDeviceAssets,
        getAssetDevice: getAssetDevice,
        //Asset Types
        getAssetTypeList: getAssetTypeList,
        addUpdateAssetType: addUpdateAssetType,
        deleteAssetType: deleteAssetType,
        getAssetTypeCount: getAssetTypeCount,
        //Asset Models
        getAssetModelList: getAssetModelList,
        addUpdateAssetModel: addUpdateAssetModel,
        deleteAssetModel: deleteAssetModel,
        //Device and Job manager
        getDeviceList: getDeviceList,
        getActiveDeviceList: getActiveDeviceList,
        updateDeviceStatus: updateDeviceStatus,
        getDeviceCertificate: getDeviceCertificate,
        addUpdateDevice: addUpdateDevice,
        getImageList: getImageList,
        uploadImage: uploadImage,
        getOtaJobList: getOtaJobList,
        createOtaJob: createOtaJob,
        updateDeviceShadow: updateDeviceShadow,
        //Device Types
        getDeviceTypeList: getDeviceTypeList,
        addUpdateDeviceType: addUpdateDeviceType,
        deleteDeviceType: deleteDeviceType,
        //Training Data
        getDeviceLogs: getDeviceLogs,
        fetchData: fetchData,
        postData: postData,
        //asset dashboard
        getAssetDBSummary: getAssetDBSummary,
        getLiftSummary: getLiftSummary,
        //chart data
        getEnergyDetails: getEnergyDetails,
        getMileageDetails: getMileageDetails,
        getEscStateDetails: getEscStateDetails,
        getDoorCycleDetails: getDoorCycleDetails,
        getRawEnergyDetails: getRawEnergyDetails,
        getActiveHoursDetails: getActiveHoursDetails,
        getMaxSpeedDetailsMMU: getMaxSpeedDetailsMMU,
        getMaxAccelerationDetailsMMU: getMaxAccelerationDetailsMMU,
        getMaxDecelerationDetailsMMU: getMaxDecelerationDetailsMMU,
        getTiltDetailsMMU: getTiltDetailsMMU,
        getLiftHeartBeat: getLiftHeartBeat,
        //alert
        getAlertList: getAlertList,
        getAlertStatusData: getAlertStatusData,
        getAlertPrioData: getAlertPrioData,
        addAlertComment: addAlertComment,
        getFloorFrequencyDetails: getFloorFrequencyDetails,
        getfloorVelocityDetails: getfloorVelocityDetails,
        getAssetVelocityDetails: getAssetVelocityDetails,
        getPowerDetails: getPowerDetails,
        getFloorTansitionDetails: getFloorTansitionDetails,
        getDeviceDetails: getDeviceDetails,
        linkDevice: linkDevice,
        isTokenValid: isTokenValid,
        //Dashboard
        getDBMetric: getDBMetric,
        getDBOnlineStat: getDBOnlineStat,
        getDBAvgMetric: getDBAvgMetric,
        getDBAssets: getDBAssets,
        getAssetDet: getAssetDet,
        getDBAssetMap: getDBAssetMap,
        //Asset Monitor 
        getAssetLocTree: getAssetLocTree,

        //Alert Rule Configuration
        getAlertRules: getAlertRules,
        addAlertRule: addAlertRule,
        deleteAlertRule: deleteAlertRule,
        saveAssetList: saveAssetList,
        getAssetListTree: getAssetListTree
    };
});
