# 系统

## 定义
```go

package model

type SystemParam struct {
	ID            int `gorm:"primary_key;AUTO_INCREMENT"`
	RelayPort     int    //串口
	SaveLogTime   int    //保存日志的时间 （天
	MqAddress     string //mqtt地址
	AutoResetTime int64  //自动消除
}


```

## 接口 

### 获取系统设置参数
`/get_system`

#### 方法
`get`

#### 参数:  

#### 返回:	

```json
{
  "success": true,
  "err_msg": "",
  "data": {
    "branch_num": 32,
    "relay_port": 2,
    "save_log_time": 30,
    "mq_address": "192.168.0.248",
    "auto_reset_time": 0
  }
}

```

### 设置系统参数
`/set_system`

#### 方法
`post`

#### 参数:  
```json
{
  "branch_num": 32,
  "relay_port": 2,
  "save_log_time": 30,
  "mq_address": "192.168.0.248",
  "auto_reset_time": 0
}

```
#### 返回:	

##### 错误
```json
{
  "success": false,
  "err_msg": "参数格式非法",
  "data": []
}
```
##### 正确
```json
{
  "success": true,
  "err_msg": "",
  "data": []
}
```


### 重置继电器
`/reset_relay`

#### 方法
`post`

#### 参数:  

#### 返回:	

##### 错误
```json
{
  "success": false,
  "err_msg": "重置失败,请稍后重试",
  "data": []
}
```
##### 正确
```json
{
  "success": true,
  "err_msg": "",
  "data": []
}
```
