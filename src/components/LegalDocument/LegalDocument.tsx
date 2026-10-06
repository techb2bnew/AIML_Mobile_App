import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { style as fontStyle, spacings } from '../../constant/Fonts';
import { neuralViolet, textBody, textDark, textMuted } from '../../constant/Color';
import { LegalDocumentContent } from '../../constants/text/legal';

interface LegalDocumentProps {
  content: LegalDocumentContent;
}

const LegalDocument: React.FC<LegalDocumentProps> = ({ content }) => (
  <View>
    <Text style={styles.updated}>Last updated: {content.lastUpdated}</Text>
    <Text style={styles.paragraph}>{content.intro}</Text>

    {content.sections.map(section => (
      <View key={section.title} style={styles.section}>
        <Text style={styles.heading}>{section.title}</Text>
        {section.paragraphs?.map(text => (
          <Text key={text} style={styles.paragraph}>
            {text}
          </Text>
        ))}
        {section.bullets?.map(text => (
          <View key={text} style={styles.bulletRow}>
            <View style={styles.bulletDot} />
            <Text style={[styles.paragraph, styles.bulletText]}>{text}</Text>
          </View>
        ))}
      </View>
    ))}
  </View>
);

const styles = StyleSheet.create({
  updated: {
    color: textMuted,
    ...fontStyle.fontSizeSmall1x,
    marginBottom: spacings.normalx,
  },
  section: {
    marginTop: spacings.large,
  },
  heading: {
    color: textDark,
    ...fontStyle.fontSizeMedium,
    ...fontStyle.fontWeightMedium,
    marginBottom: spacings.small,
  },
  paragraph: {
    color: textBody,
    ...fontStyle.fontSizeNormal,
    lineHeight: 22,
    marginBottom: spacings.small,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  bulletDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: neuralViolet,
    marginTop: 8,
    marginRight: spacings.normalx,
  },
  bulletText: {
    flex: 1,
  },
});

export default LegalDocument;
