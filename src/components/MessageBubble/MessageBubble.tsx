import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { style as fontStyle, spacings } from '../../constant/Fonts';
import { BaseStyle } from '../../constant/Style';
import { accentColor, onAccent, textBody } from '../../constant/Color';
import { widthPercentageToDP as wp } from '../../utils';
import { ConversationMessage } from '../../types/conversation';

interface MessageBubbleProps {
  message: ConversationMessage;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const isUser = message.sender === 'user';

  return (
    <View style={[styles.row, isUser ? styles.rowUser : styles.rowAi]}>
      <View style={[styles.bubble, isUser ? styles.bubbleUser : styles.bubbleAi]}>
        <Text style={isUser ? styles.textUser : styles.textAi}>{message.text}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    width: '100%',
    marginBottom: spacings.normalx,
  },
  rowUser: {
    alignItems: 'flex-end',
  },
  rowAi: {
    alignItems: 'flex-start',
  },
  bubble: {
    maxWidth: wp(78),
    borderRadius: 16,
    paddingVertical: spacings.normalx,
    paddingHorizontal: spacings.large,
  },
  bubbleUser: {
    backgroundColor: accentColor,
    borderBottomRightRadius: 4,
  },
  bubbleAi: {
    ...BaseStyle.surfaceGradientBg,
    borderBottomLeftRadius: 4,
  },
  textUser: {
    color: onAccent,
    ...fontStyle.fontSizeNormal1x,
  },
  textAi: {
    color: textBody,
    ...fontStyle.fontSizeNormal1x,
  },
});

export default MessageBubble;
