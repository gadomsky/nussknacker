import React, {Children, PropsWithChildren, useMemo, useState} from "react"
import styles from "./CollapsibleToolbar.styl"
import {useSelector, useDispatch} from "react-redux"
import {toggleToolbar} from "../../actions/nk/toolbars"
import {useDragHandler} from "./DragHandle"
import Panel from "react-bootstrap/lib/Panel"
import classNames from "classnames"
import {getIsCollapsed} from "../../reducers/selectors/toolbars"
import ErrorBoundary from "../common/ErrorBoundary"
import {ReactComponent as CollapseIcon} from "../../assets/img/arrows/panel-hide-arrow.svg"

export type CollapsibleToolbarProps = PropsWithChildren<{
  id?: string,
  title?: string,
  isHidden?: boolean,
}>

export function CollapsibleToolbar({title, children, isHidden, id}: CollapsibleToolbarProps): JSX.Element | null {
  const dispatch = useDispatch()
  const isCollapsed = useSelector(getIsCollapsed(id))
  const [isShort, setIsShort] = useState(isCollapsed)
  const [isCollapsing, setIsCollapsing] = useState(false)
  const [isExpanding, setIsExpanding] = useState(false)
  const onToggle = () => id && dispatch(toggleToolbar(id, !isCollapsed))
  const isCollapsible = !!id

  const {tabIndex, ...handlerProps} = useDragHandler()

  const collapseCallbacks = useMemo(() => ({
    onEnter: () => {
      setIsCollapsing(false)
      setIsExpanding(true)
      setIsShort(false)
    },
    onEntered: () => setIsExpanding(false),
    onExit: () => {
      setIsCollapsing(true)
      setIsExpanding(false)
      setIsShort(true)
    },
    onExited: () => setIsCollapsing(false),
  }), [])

  if (isHidden || !Children.count(children)) {
    return null
  }

  return (
    <div className={styles.wrapper}>
      <Panel
        expanded={!isCollapsed}
        onToggle={onToggle}
        bsClass={styles.panel}
        className={classNames(
          isShort && styles.collapsed,
          isExpanding && styles.expanding,
          isCollapsing && styles.collapsing,
        )}
      >
        {title ?
          (
            <Panel.Heading {...handlerProps}>
              <Panel.Title toggle>
                <div className={styles.collapseTitle}>{title}</div>
                {isCollapsible && (
                  <CollapseIcon className={styles.collapseIcon}/>
                )}
              </Panel.Title>
            </Panel.Heading>
          ) :
          null}
        <Panel.Collapse {...collapseCallbacks}>
          <Panel.Body>
            <ErrorBoundary>
              {children}
            </ErrorBoundary>
          </Panel.Body>
        </Panel.Collapse>
      </Panel>
    </div>
  )
}
