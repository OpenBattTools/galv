import React, {Component} from "react";
import Stack, {StackProps} from "@mui/material/Stack";
import IconButton, {IconButtonProps} from "@mui/material/IconButton";
import Icon from "@mui/material/Icon";
import SearchIcon from "@mui/icons-material/Search";
import SaveIcon from "@mui/icons-material/Save";
import DeleteIcon from "@mui/icons-material/Delete";
import {SvgIconProps} from "@mui/material/SvgIcon"
import useStyles from "./UseStyles";

export type ActionButtonsProps = {
  classes: ReturnType<typeof useStyles>;
  onInspect?: () => void;
  onSave?: () => void;
  onDelete?: () => void;
  inspectButtonProps?: IconButtonProps;
  saveButtonProps?: IconButtonProps;
  deleteButtonProps?: IconButtonProps;
  inspectIconProps?: SvgIconProps & {component?: any};
  saveIconProps?: SvgIconProps & {component?: any};
  deleteIconProps?: SvgIconProps & {component?: any};
  wrapperElementProps?: StackProps;
}

/**
 * Group together commonly displayed action buttons.
 *
 * Buttons included are:
 * - Inspect
 * - Save
 * - Delete
 *
 * Buttons are included where the on[ButtonName] property is specified.
 * Their properties can be customised with [buttonName]ButtonProps,
 * and the properties of the child SvgIcon by [buttonName]IconProps.
 *
 * The wrapper element is a <Stack direction="row"> element and
 * can be customised with the wrapperElementProps prop.
 */
export default class ActionButtons extends Component<ActionButtonsProps, {}> {
  render() {
    return (
      <Stack direction="row" {...this.props.wrapperElementProps}>
        {
          this.props.onInspect !== undefined &&
            <IconButton
                onClick={this.props.onInspect}
                {...this.props.inspectButtonProps}
            >
                <Icon
                    component={SearchIcon}
                    className={this.props.classes.infoIcon}
                    {...this.props.inspectIconProps}
                />
            </IconButton>
        }
        {
          this.props.onSave !== undefined &&
            <IconButton
                onClick={this.props.onSave}
                {...this.props.saveButtonProps}
            >
                <Icon
                    component={SaveIcon}
                    className={this.props.classes.saveIcon}
                    {...this.props.saveIconProps}
                />
            </IconButton>
        }
        {
          this.props.onDelete !== undefined &&
            <IconButton
                onClick={this.props.onDelete}
                sx={{marginLeft: 2}}
                {...this.props.deleteButtonProps}
            >
                <Icon
                    component={DeleteIcon}
                    className={this.props.classes.deleteIcon}
                    {...this.props.deleteIconProps}
                />
            </IconButton>
        }
      </Stack>
    )
  }
}