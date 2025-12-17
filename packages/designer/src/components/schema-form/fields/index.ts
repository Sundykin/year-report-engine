/**
 * 内置控件注册
 */

import { registerBuiltinField } from '../useSchemaForm'
import NumberInput from './NumberInput.vue'
import TextInput from './TextInput.vue'
import TextareaInput from './TextareaInput.vue'
import ColorPicker from './ColorPicker.vue'
import SelectInput from './SelectInput.vue'
import CheckboxInput from './CheckboxInput.vue'
import RangeSlider from './RangeSlider.vue'
import ButtonGroup from './ButtonGroup.vue'
import DatetimeInput from './DatetimeInput.vue'

// 注册所有内置控件
export function registerBuiltinFields() {
  registerBuiltinField('number', NumberInput)
  registerBuiltinField('text', TextInput)
  registerBuiltinField('textarea', TextareaInput)
  registerBuiltinField('color', ColorPicker)
  registerBuiltinField('select', SelectInput)
  registerBuiltinField('checkbox', CheckboxInput)
  registerBuiltinField('range', RangeSlider)
  registerBuiltinField('button-group', ButtonGroup)
  registerBuiltinField('datetime', DatetimeInput)
}

// 导出所有控件组件
export {
  NumberInput,
  TextInput,
  TextareaInput,
  ColorPicker,
  SelectInput,
  CheckboxInput,
  RangeSlider,
  ButtonGroup,
  DatetimeInput
}
