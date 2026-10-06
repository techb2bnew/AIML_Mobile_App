import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { style as fontStyle, spacings } from '../../constant/Fonts';
import { BaseStyle } from '../../constant/Style';
import {
  neuralBorder,
  neuralText,
  neuralTextMuted,
  neuralViolet,
} from '../../constant/Color';
import { widthPercentageToDP as wp } from '../../utils';
import { ConversationMessage } from '../../types/conversation';
import {
  MESSAGE_COPIED,
  MESSAGE_COPY,
  MESSAGE_SENDER_AI,
  MESSAGE_SENDER_YOU,
} from '../../constants/text/en';

// The clipboard is a native module. If this binary was built before it was
// added, importing it throws — in that case the Copy button is simply hidden
// instead of crashing the screen.
let Clipboard: { setString: (text: string) => void } | null = null;
try {
  Clipboard = require('@react-native-clipboard/clipboard').default;
} catch {
  Clipboard = null;
}

interface MessageBubbleProps {
  message: ConversationMessage;
}

const COPIED_FEEDBACK_MS = 1600;

const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const isUser = message.sender === 'user';
  const [isCopied, setIsCopied] = useState(false);
  const resetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (resetTimer.current) {
        clearTimeout(resetTimer.current);
      }
    },
    [],
  );

  const handleCopy = () => {
    Clipboard?.setString(message.text);
    setIsCopied(true);
    if (resetTimer.current) {
      clearTimeout(resetTimer.current);
    }
    resetTimer.current = setTimeout(() => setIsCopied(false), COPIED_FEEDBACK_MS);
  };

  if (isUser) {
    return (
      <View style={styles.rowUser}>
        <Text style={styles.senderUser}>{MESSAGE_SENDER_YOU}</Text>
        <View style={[styles.bubble, styles.bubbleUser]}>
          <Text style={styles.text}>{message.text}</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.rowAi}>
      <View style={styles.avatar}>
        <Icon name="creation" size={wp(5)} color="#C4B5FD" />
      </View>
      <View style={styles.aiBody}>
        <Text style={styles.senderAi}>{MESSAGE_SENDER_AI}</Text>
        <View style={[styles.bubble, styles.bubbleAi]}>
          <Text style={styles.text}>{message.text}</Text>
        </View>
        {Clipboard && (
          <TouchableOpacity
            onPress={handleCopy}
            activeOpacity={0.6}
            hitSlop={styles.hitSlop}
            style={styles.copyButton}
          >
            <Icon
              name={isCopied ? 'check' : 'content-copy'}
              size={wp(4)}
              color={isCopied ? neuralViolet : neuralTextMuted}
            />
            <Text style={[styles.copyText, isCopied && { color: neuralViolet }]}>
              {isCopied ? MESSAGE_COPIED : MESSAGE_COPY}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  rowUser: {
    width: '100%',
    alignItems: 'flex-end',
    marginBottom: spacings.large,
  },
  rowAi: {
    ...BaseStyle.flexDirectionRow,
    width: '100%',
    marginBottom: spacings.large,
  },
  avatar: {
    ...BaseStyle.alignJustifyCenter,
    width: wp(9),
    height: wp(9),
    borderRadius: wp(4.5),
    borderWidth: 1,
    borderColor: neuralBorder,
    backgroundColor: 'rgba(20,16,43,0.9)',
    marginRight: spacings.small,
    marginTop: spacings.small,
  },
  aiBody: {
    flex: 1,
    alignItems: 'flex-start',
  },
  senderUser: {
    color: neuralTextMuted,
    ...fontStyle.fontSizeSmall1x,
    marginBottom: spacings.xxsmall,
    marginRight: spacings.xsmall,
  },
  senderAi: {
    color: neuralTextMuted,
    ...fontStyle.fontSizeSmall1x,
    marginBottom: spacings.xxsmall,
    marginLeft: spacings.xsmall,
  },
  bubble: {
    maxWidth: wp(80),
    borderWidth: 1,
    paddingVertical: spacings.normalx,
    paddingHorizontal: spacings.large,
  },
  bubbleUser: {
    backgroundColor: 'rgba(12,15,30,0.88)',
    borderColor: 'rgba(170,178,235,0.55)',
    borderRadius: 22,
    borderTopRightRadius: 6,
  },
  bubbleAi: {
    backgroundColor: 'rgba(6,8,17,0.9)',
    borderColor: 'rgba(170,178,235,0.45)',
    borderRadius: 22,
    borderTopLeftRadius: 6,
  },
  text: {
    color: neuralText,
    ...fontStyle.fontSizeNormal1x,
    lineHeight: 22,
  },
  copyButton: {
    ...BaseStyle.flexDirectionRow,
    ...BaseStyle.alignItemsCenter,
    marginTop: spacings.small,
    marginLeft: spacings.xsmall,
  },
  copyText: {
    color: neuralTextMuted,
    ...fontStyle.fontSizeSmall2x,
    marginLeft: spacings.xsmall,
  },
  hitSlop: { top: 8, bottom: 8, left: 8, right: 8 },
});

export default MessageBubble;
