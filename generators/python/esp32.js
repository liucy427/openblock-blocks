/**
 * Visual Blocks Language
 *
 * Copyright 2021 openblock.cc.
 * https://github.com/zhengyangliu/scratch-blocks
 *
 * Licensed under the Apache License, Version 2.0 (the 'License');
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an 'AS IS' BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
'use strict';

goog.provide('Blockly.Python.esp32');

goog.require('Blockly.Python');


Blockly.Python['microPython_pin_esp32InitPinMode'] = function(block) {
  var arg0 = block.getFieldValue('PIN');
  var arg1 = block.getFieldValue('MODE') || 'IN';

  Blockly.Python.imports_['Pin'] = 'from machine import Pin';

  if (arg1 === 'IN' || arg1 === 'OUT') {
    return 'pin' + arg0 + ' = Pin(' + arg0 + ', Pin.' + arg1 + ')\n';
  } else {
    return 'pin' + arg0 + ' = Pin(' + arg0 + ', Pin.IN, Pin.' + arg1 + ')\n';
  }
};

Blockly.Python['microPython_pin_menu_level'] = function(block) {
  var code = block.getFieldValue('level') || '0';
  return [code, Blockly.Python.ORDER_ATOMIC];
};

Blockly.Python['microPython_pin_esp32SetDigitalOutput'] = function(block) {
  var pin = block.getFieldValue('PIN') || '0';
  var level = Blockly.Python.valueToCode(block, 'LEVEL', Blockly.Python.ORDER_FUNCTION_CALL) || '1';

  return 'pin' + pin + '.value(' + level + ')\n';
};

Blockly.Python['microPython_pin_esp32SetPwmOutput'] = function(block) {
  var pin = block.getFieldValue('PIN');
  var outValue = Blockly.Python.valueToCode(block, 'OUT', Blockly.Python.ORDER_FUNCTION_CALL) || '0';

  Blockly.Python.imports_['Pin'] = 'from machine import Pin';
  Blockly.Python.imports_['PWM'] = 'from machine import PWM';
  Blockly.Python.variables_['PWM' + pin] = 'pwm' + pin + ' = PWM(Pin(' + pin + '), freq = 490)';

  return 'pwm' + pin + '.duty(' + outValue + ')\n';
};

Blockly.Python['microPython_pin_esp32SetDACOutput'] = function(block) {
  var pin = block.getFieldValue('PIN');
  var outValue = Blockly.Python.valueToCode(block, 'OUT', Blockly.Python.ORDER_FUNCTION_CALL) || '0';

  Blockly.Python.imports_['Pin'] = 'from machine import Pin';
  Blockly.Python.imports_['DAC'] = 'from machine import DAC';
  Blockly.Python.variables_['DAC' + pin] = 'dac' + pin + ' = DAC(Pin(' + pin + '))';

  return 'dac' + pin + '.write(' + outValue + ')\n';
};

Blockly.Python['microPython_pin_esp32ReadDigitalPin'] = function(block) {
  var pin = block.getFieldValue('PIN');

  return ['pin' + pin + '.value()', Blockly.Python.ORDER_ATOMIC];
};

Blockly.Python['microPython_pin_esp32ReadAnalogPin'] = function(block) {
  var pin = block.getFieldValue('PIN');

  Blockly.Python.imports_['Pin'] = 'from machine import Pin';
  Blockly.Python.imports_['ADC'] = 'from machine import ADC';
  Blockly.Python.variables_['ADC' + pin] = 'adc' + pin + ' = ADC(Pin(' + pin + '))';

  return ['adc' + pin + '.read_u16()', Blockly.Python.ORDER_ATOMIC];
};

Blockly.Python['microPython_pin_esp32ReadTouchPin'] = function(block) {
  var pin = block.getFieldValue('PIN');

  Blockly.Python.imports_['Pin'] = 'from machine import Pin';
  Blockly.Python.imports_['TouchPad'] = 'from machine import TouchPad';
  Blockly.Python.variables_['ADC' + pin] = 't' + pin + ' = TouchPad(Pin(' + pin + '))';

  return ['t' + pin + '.read()', Blockly.Python.ORDER_ATOMIC];
};

Blockly.Python['microPython_pin_esp32SetServoOutput'] = function(block) {

  var pin = block.getFieldValue('PIN');
  var angle = Blockly.Python.valueToCode(block, 'OUT', Blockly.Python.ORDER_FUNCTION_CALL) || '0';

  Blockly.Python.imports_['Pin'] = 'from machine import Pin';
  Blockly.Python.imports_['Servo'] = 'from pyb import Servo';
  Blockly.Python.variables_['Servo' + pin] = 'servo' + pin + ' = Servo(' + pin + ')';

  return 'servo' + pin + '.angle' + '(' + angle + ');\n';
};

Blockly.Python['microPython_pin_esp32AttachInterrupt'] = function(block) {
  var pin = block.getFieldValue('PIN');
  var mode = block.getFieldValue('MODE') || 'RISING';

  var branch = Blockly.Python.statementToCode(block, 'SUBSTACK');
  branch = Blockly.Python.addLoopTrap(branch, block.id);

  if (branch) {
    var variablesName = [];
    for (var x in Blockly.Python.variables_) {
      variablesName.push(Blockly.Python.variables_[x].slice(0, Blockly.Python.variables_[x].indexOf('=') - 1));
    }
    if (variablesName.length !== 0) {
      branch = Blockly.Python.INDENT + "global " + variablesName.join(', ') + "\n" + branch;
    }
  } else {
    branch = Blockly.Python.INDENT + 'pass\n';
  }

  Blockly.Python.imports_['Pin'] = 'from machine import Pin';
  Blockly.Python.libraries_['definitions_ISR_' + mode + pin] =
    'def ISR_' + mode + '_' + pin + '(pin):\n' + branch;

  if (mode === 'CHANGE') {
    return 'Pin(' + pin + ').irq(handler = ISR_' + mode + '_' + pin +
        ', trigger = (Pin.IRQ_RISING or Pin.IRQ_FALLING))\n';
  } else {
    return 'Pin(' + pin + ').irq(handler = ISR_' + mode + '_' + pin + ', trigger = Pin.IRQ_' + mode + ')\n';
  }
};
