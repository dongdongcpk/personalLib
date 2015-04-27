var fs = require('fs');

function Transfer(req, resp) {
    this.req = req;
    this.resp = resp;
}

/**
 * 计算上次的断点信息
 * [@param] {string} Range 请求http头文件中的断点信息，如果没有则为undefined，格式（range: bytes=232323-）
 * [@return] {integer} startPos 开始的下载点
 */
Transfer.prototype._calStartPosition = function(Range) {
    var startPos = 0;
    if( typeof Range != 'undefined') {
        var startPosMatch = /^bytes=([0-9]+)-$/.exec(Range);
        startPos = Number(startPosMatch[1]);
    }
    return startPos;
};

/**
 * 配置头文件
 * [@param] {object} Config 头文件配置信息（包含了下载的起始位置和文件的大小）
 */
Transfer.prototype._configHeader = function(Config) {
    var startPos = Config.startPos,
        fileSize = Config.fileSize,
        resp = this.resp;
    resp.setHeader('Content-Length', fileSize);
    // 如果startPos为0，表示文件从0开始下载的，否则则表示是断点下载的。
    if(startPos == 0) {
        resp.setHeader('Accept-Range', 'bytes');
    } else {
        resp.setHeader('Content-Range', 'bytes ' + startPos + '-' + (fileSize - 1) + '/' + fileSize);
    }
    resp.writeHead(206, 'Partial Content', {
        'Content-Type' : 'application/octet-stream'
    });
};

/**
 * 初始化配置信息
 * [@param] {string} filePath
 * [@param] {function} down 下载开始的回调函数
 */
Transfer.prototype._init = function(filePath, down) {
    var config = {};
    var self = this;
    fs.stat(filePath, function(error, state) {
        if(error)
            throw error;

        config.fileSize = state.size;
        var range = self.req.headers.range;
        config.startPos = self._calStartPosition(range);
        self.config = config;
        self._configHeader(config);
        down();
    });
};

/**
 * 生成大文件文档流，并发送
 * [@param] {string} filePath 文件地址
 */
Transfer.prototype.Download = function(filePath) {
    var self = this;
    fs.exists(filePath, function(exist) {
        if(exist) {
            self._init(filePath, function() {
                var config = self.config,
                resp = self.resp,
                fReadStream = fs.createReadStream(filePath, {
                    start : config.startPos,
                    end : config.fileSize
                });
                fReadStream.pipe(resp);
            });
        } else {
            console.log('文件不存在！');
            return;
        }
    });
};

module.exports = Transfer;