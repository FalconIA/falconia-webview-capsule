import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { LayoutRectangle, StyleProp, StyleSheet, Text, View, ViewStyle } from "react-native";
import { Face, RNCamera } from "react-native-camera";
import { pxToDp } from "../utils/ui-utils";

interface Props {
  style?: StyleProp<ViewStyle>;
  faceCache?: number;
  boxFlipHorizontally?: boolean;
  boxFlipVertically?: boolean;
  onDetected?: () => void;
}

interface DOMRect {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
}

const FaceCamera: React.FC<Props> = ({ style, faceCache, boxFlipHorizontally, boxFlipVertically, onDetected }) => {

  const refWrapper = useRef(null);
  const refMissedFace = useRef(0);
  const refLastFaceId = useRef<number>();
  const refDetectedTimes = useRef(0);
  const [ layout, setLayout ] = useState<LayoutRectangle>();
  const [ faces, setFaces ] = useState<(DOMRect & { faceId?: number })[]>();

  useEffect(() => {
    console.log(refWrapper.current);
  }, [layout]);

  if (layout) {
    // console.log(style, layout.width, layout.height);
  }

  return (
    <View
      ref={refWrapper}
      onLayout={(event) => {
        if (!layout || layout.width !== event.nativeEvent.layout.width || layout.height !== event.nativeEvent.layout.height) {
          setLayout(event.nativeEvent.layout);
          console.log(event.nativeEvent.layout);
        }
      }}
      style={[{
        backgroundColor: 'black',
      }, style]}
    >
      {layout && layout.width && layout.height ? (
        <View style={{position: 'relative', width: layout.width, height: layout.height}}>
          <RNCamera
            style={{ position: 'absolute', left: 0, top: 0, width: '100%', height: '100%', overflow: 'hidden' }}
            type="front"
            captureAudio={false}
            // faceDetectionMode="accurate"
            onFacesDetected={(response: { faces: Face[] }) => {
              if (onDetected && response.faces.length === 1) {
                const face = response.faces[0];
                if (refLastFaceId.current === face.faceID) {
                  refDetectedTimes.current++;
                } else {
                  refLastFaceId.current = face.faceID;
                  refDetectedTimes.current = 0;
                }
                if (refDetectedTimes.current === 3) {
                  onDetected();
                }
              }

              if (response.faces.length > 0) {
                const maxWidth = layout.width;
                const maxHeight = layout.height;
                const rects = response.faces.map((face) => {
                  console.log(face);
                  const rect = {
                    x: face.bounds.origin.x,
                    y: face.bounds.origin.y,
                    width: face.bounds.size.width,
                    height: face.bounds.size.height,
                    faceId: face.faceID,
                  };
                  if (rect.x < 0) {
                    rect.width += rect.x;
                    rect.x = 0;
                  } else if (rect.x > maxWidth) {
                    rect.width -= (rect.x - maxWidth);
                    rect.x = maxWidth;
                  }
                  if (rect.x + rect.width > maxWidth) {
                    rect.width = maxWidth - rect.x;
                  }
                  if (rect.y < 0) {
                    rect.height += rect.y;
                    rect.y = 0;
                  } else if (rect.y > maxHeight) {
                    rect.height -= (rect.y - maxHeight);
                    rect.y = maxHeight;
                  }
                  if (rect.y + rect.height > maxHeight) {
                    rect.height = maxHeight - rect.y;
                  }
                  return rect;
                });
                // console.log(response.faces.length, response.faces[0]);
                refMissedFace.current = 0;
                setFaces(rects);
              } else if (faceCache && faceCache > 0) {
                if (refMissedFace.current === faceCache) {
                  refMissedFace.current++;
                  setFaces([]);
                } else if (refMissedFace.current < faceCache) {
                  refMissedFace.current++;
                }
              } else {
                setFaces([]);
              }
            }}
            onFaceDetectionError={(response: { isOperational: boolean }) => {
              console.log('onFaceDetectionError:', response);
            }}
          />
          {faces ? faces.map(face => (
            <View
              key={face.faceId}
              style={[styles.faceBorder, {
                left: !boxFlipHorizontally ? face.x : undefined,
                right: boxFlipHorizontally ? face.x : undefined,
                top: !boxFlipVertically ? face.y : undefined,
                bottom: boxFlipVertically ? face.y : undefined,
                width: face.width,
                height: face.height,
              }]}
            >
              <Text style={[styles.faceId]}>{face.faceId}</Text>
            </View>
          )) : null}
        </View>
      ): null}
    </View>
  )
};

const styles = StyleSheet.create({
  faceBorder: {
    position: 'absolute',
    borderColor: 'cyan',
    borderWidth: 1,
    alignItems: 'flex-start',
  },
  faceId: {
    borderColor: 'cyan',
    borderRightWidth: 1,
    borderBottomWidth: 1,
    color: 'cyan',
    padding: 2,
    fontSize: 10,
    lineHeight: 10,
  }
});

export default FaceCamera;
