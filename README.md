## 继电器服务端页面 relay-server-www

### 获取配置
`GET` `http://localhost:9009/api/config`
```json
{
    "status": true,
    "message": "获取配置信息",
    "data": {
        "port": 9009,
        "address": "COM7",
        "slave_id": 1,
        "branch_length": 8,
        "white_list": [
            "*",
            "::1",
            "127.0.0.1",
            "192.168.0.7"
        ]
    }
}
```

#### 更新配置
`POST` `http://localhost:9009/api/config`

#### header
`content-type:application/json`

#### 参数
```json
{
	"port": 9009,
	"address": "COM7",
	"slave_id": 1,
	"branch_length": 8,
	"white_list": [
		"*",
		"::1",
		"127.0.0.1",
		"192.168.0.7"
	]
}
```

#### 闭合所有
`GET` `http://localhost:9009/api/on-all`

#### 断开所有
`GET` `http://localhost:9009/api/off-all`

#### 闭合继电器某些路
`GET` `http://localhost:9009/api/on/{branches}`

##### 示例
`http://localhost:9009/api/on/0,1,2,3,4,5,6`
> 闭合0,1,2,3,4,5,6路

#### 断开继电器某些路
`GET` `http://localhost:9009/api/off/{branches}`

##### 示例
`http://localhost:9009/api/off/0,1,2,3,4,5,6`
> 断开0,1,2,3,4,5,6路

#### 翻转继电器某些路
`GET` `http://localhost:9009/api/flip/{branches}`
 
##### 示例
`GET` `http://localhost:9009/api/flip/0,1,2,3,4,5,6`
> - 如果0,1,2,3,4,5,6路闭合,则翻转断开
> - 如果0,1,2,3,4,5,6路断开,则翻转闭合

#### 闭合某路一段时间后自动断开
`GET` `http://localhost:9009/api/on-point/{branch}/{time}`

##### 示例
`http://localhost:9009/api/on-point/0/2000`
> 闭合第0路继电器2000毫秒后断开

#### 断开某路一段时间后自动闭合
`GET`  `http://localhost:9009/api/off-point/{branch}/{time}`

##### 示例
`http://localhost:9009/api/off-point/0/2000`
> 断开第0路继电器2000毫秒后闭合

#### ping
`GET` `http://localhost:9009/api/ping`

##### 返回值
```json
{
	"status": true,
	"message": "ping",
	"data": {
		"connected": true,
		"connected_time": 1350,
		"running_time": 1350,
		"status": [
			1,
			1,
			1,
			1,
			1,
			1,
			1,
			0
		],
		"message": "success"
	}
}
```
#### 版本
`GET` `http://localhost:9009/api/version`
```json
{
	"status": true,
	"message": "获取版本",
	"data": [{
			"tag": "0.0.8",
			"log": "update module address",
			"status": "Base",
			"hash": "a96c3cf8276b39ef503fbafc96bbad6b",
			"git_hash": "",
			"created_at": "2020.09.24 15:54:44"
		},
		{
			"tag": "0.0.7",
			"log": "add LICENSE",
			"status": "Base",
			"hash": "499050ce9289cd6ab663e3ae3630700a",
			"git_hash": "c7b9505af0431c01d6cdb9f6b25c8b70a57ab8d5",
			"created_at": "2020.09.24 10:00:11"
		},
		{
			"tag": "0.0.6",
			"log": "update...",
			"status": "Base",
			"hash": "cc122a930a75ac3e9bb290fa4654b62e",
			"git_hash": "b3783d195bdc7f2c609ab35edc23b6ba7c319ba0",
			"created_at": "2020.08.28 17:04:53"
		},
		{
			"tag": "0.0.1",
			"log": "init",
			"status": "Base",
			"hash": "46c9ab35431609ae4950d5ec6d1d7d2a",
			"git_hash": "6effa2b0971e2449c9fb223b2c966d48cb5ea09f",
			"created_at": "2019.12.03 16:54:52"
		}
	]
}
```
### WebSocket接口 
`ws://localhost:9009/ws`

#### 返回值通用结构
```json
{
  "type": "log",
  "": ""
}
```
### `type == log`
```json
{
	"level": "info",
	"msg": "新的websocket连接: ::1-128",
	"time": "2020-09-27 14:35:28",
	"type": "log"
}
```
### `type == status`
```json
{
	"type": "status",
	"data": {
		"connected": true,
		"connected_time": 1220,
		"running_time": 1220,
		"status": [1, 1, 1, 1, 1, 1, 1, 0],
		"message": "success"
	}
}
```
