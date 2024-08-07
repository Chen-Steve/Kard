import React from 'react';
import { SketchPicker, SketchPickerProps } from 'react-color';

const SketchPickerWrapper: React.FC<SketchPickerProps> = ({ color = '#000000', ...props }) => {
  return <SketchPicker color={color} {...props} width="225px" />;
};

export default SketchPickerWrapper;