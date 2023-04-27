import { longModeRatio } from '../variables'
import getRotateSize from './getRotateSize'
export default function getSuitableImageSize (naturalWidth, naturalHeight, rotate) {
  const [currentWidth, currentHeight, isVertical] = getRotateSize(rotate, innerWidth, innerHeight)

  let y = 0
  let width = currentWidth
  let height = currentHeight

  // 自适应宽高
  const autoWidth = (naturalWidth / naturalHeight) * currentHeight
  const autoHeight = (naturalHeight / naturalWidth) * currentWidth

  if (naturalWidth < currentWidth && naturalHeight < currentHeight) {
    width = naturalWidth
    height = naturalHeight
  } else if (naturalWidth < currentWidth && naturalHeight >= currentHeight) {
    width = autoWidth
  } else if (naturalWidth >= currentWidth && naturalHeight < currentHeight) {
    height = autoHeight
  } else if (naturalWidth / naturalHeight > currentWidth / currentHeight) {
    height = autoHeight
  } else if (naturalHeight / naturalWidth >= longModeRatio && !isVertical) {
    // 长图模式
    height = autoHeight
    y = (height - currentHeight) / 2
  } else {
    width = autoWidth
  }
  return {
    width,
    height,
    x: 0,
    y,
    pause: true
  }
}
