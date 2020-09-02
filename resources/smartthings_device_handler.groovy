/**
 * Broadlink Bridge
 * Device Handler: v1.0.0
 *
 * MIT License
 * 
 * Copyright (c) 2020 Stephen Mendez
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */
 

metadata {
	definition (name: "Broadlink Bridge", namespace: "401Unauthorized", author: "Stephen Mendez", ocfDeviceType: "oic.d.light", runLocally: true, minHubCoreVersion: '000.017.0012', executeCommandsLocally: false) {
        capability "Actuator"
        capability "Switch"
        capability "Sensor"
        capability "Light"
    }

	simulator {}

	preferences {
    	input "internal_ip", "text", title: "IP for Broadlink Bridge", description: "(ie. 192.168.1.2)", required: true
        input "internal_port", "text", title: "Port", description: "(ie. 3000)" , required: true
        input "internal_token", "text", title: "Token", description: "(ie. abc123)" , required: true
        input "blaster_id", "text", title: "Blaster ID", description: "(ie. abc123)" , required: true
        input "ir_device_id", "text", title: "Device ID", description: "(ie. abc123)" , required: true
	}

	tiles(scale: 2) {
		multiAttributeTile(name:"switch", type: "lighting", width: 6, height: 4, canChangeIcon: true){
			tileAttribute ("device.switch", key: "PRIMARY_CONTROL") {
				attributeState "on", label:'${name}', action:"switch.off", icon:"st.switches.switch.on", backgroundColor:"#00a0dc", nextState:"turningOff"
				attributeState "off", label:'${name}', action:"switch.on", icon:"st.switches.switch.off", backgroundColor:"#ffffff", nextState:"turningOn"
				attributeState "turningOn", label:'${name}', action:"switch.off", icon:"st.switches.switch.on", backgroundColor:"#00a0dc", nextState:"turningOff"
				attributeState "turningOff", label:'${name}', action:"switch.on", icon:"st.switches.switch.off", backgroundColor:"#ffffff", nextState:"turningOn"
			}
		}

		main(["switch"])
		details(["switch"])
	}
}

def installed() {}

def updated(){}

def parse(String description) {}

def on() {
    sendHttpRequest("/blasters/"+urlEncode(blaster_id)+"/devices/"+urlEncode(ir_device_id)+"/commands/power_on/emit?token="+urlEncode(internal_token))
}

def off() {
    sendHttpRequest("/blasters/"+urlEncode(blaster_id)+"/devices/"+urlEncode(ir_device_id)+"/commands/power_off/emit?token="+urlEncode(internal_token)) 
}

def sendHttpRequest(String path) {
    def result = new physicalgraph.device.HubAction(
            [method: "POST",
            path: path,
            headers: [HOST: "${internal_ip}:${internal_port}"]],
            null,
            [callback: hubResponseReceived]
        )
    sendHubCommand(result)
}

void hubResponseReceived(physicalgraph.device.HubResponse hubResponse) {
	def body = hubResponse.json
    logger('debug', "${hubResponse.body}")
    
    if(hubResponse.status == 200 && body.status == "Done!"){
        if(this.device.currentValue("switch") == "on"){
            sendEvent(name: "switch", value: "off")
        } else {
            sendEvent(name: "switch", value: "on")
        }
    }	
}

def urlEncode(String) {
    return java.net.URLEncoder.encode(String, "UTF-8")
}

def logger(level, message) {
    def logLevel=4
    if(settings.configLoglevel) {
        logLevel = settings.configLoglevel.toInteger() ?: 0
    }
    if(level=="error"&&logLevel>0) {
        log.error message
    }
    if(level=="warn"&&logLevel>1) {
        log.warn message
    }
    if(level=="info"&&logLevel>2) {
        log.info message
    }
    if(level=="debug"&&logLevel>3) {
        log.debug message
    }
}
