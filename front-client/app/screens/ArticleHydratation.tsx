import { View, Image, StyleSheet, Dimensions, Text, Linking, ScrollView, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

export default function ArticlePauseActive() {
    const params = useLocalSearchParams();
    const id = String(params.article);
    const conseils1 = [
        {
            title: '  Alimentation',
            text: " : Les aliments riches en eau, tels que les fruits et légumes, contribuent à l'hydratation quotidienne."
        },
        {
            title: '  Activité physique',
            text: " : Une activité physique augmente la perte d'eau par la sueur, nécessitant une consommation accrue pour compenser cette perte."
        }, {
            title: '  Environnement',
            text: ': Par temps chaud ou humide, le corps perd plus d\'eau, ce qui requiert une augmentation de l\'apport hydrique.'
        }, {
            title: '  Santé',
            text: ': Certaines conditions médicales ou traitements peuvent affecter les besoins en eau.'
        }

    ]

    const conseilsp = [
        {
            title: '  Écoutez votre corps',
            text: " : La sensation de soif est un indicateur naturel des besoins en eau. Cependant, il est recommandé de ne pas attendre d'avoir soif pour boire, car la soif peut être un signe que le corps est déjà légèrement déshydraté."
        },
        {
            title: '  Répartissez votre consommation',
            text: " : Il est conseillé de boire de l\'eau régulièrement tout au long de la journée, en adaptant la quantité en fonction de vos besoins personnels."
        }

    ]
    return (
        <ScrollView style={styles.container}>
            {id === '109' && (
                <View>
                    <Image
                        source={require('../../assets/images/contenus/Rectangle_103.png')}
                        style={styles.background}
                        resizeMode="contain"
                    />
                    <ScrollView style={styles.textContainer}>
                        <Text style={styles.paragraph}>
                            {'\n'}
                            La quantité d'eau à boire quotidiennement varie en fonction de plusieurs facteurs, tels que le poids corporel, l'activité physique, l'environnement et l'état de santé général.
                            Les recommandations générales suggèrent de <Text style={styles.bold}>boire entre 1,3 litre et 2 litres d'eau par jour,</Text> mais ces besoins peuvent être ajustés selon les circonstances individuelles.
                            {'\n\n'}
                            <Text style={[styles.bold]}>Calcul basé sur le poids corporel</Text>{'\n'}
                            Une méthode courante pour estimer les besoins en eau est de multiplier le poids corporel en kilogrammes par <Text style={styles.bold}>30 millilitres</Text>.
                            Par exemple, une personne pesant 70 kg aurait besoin <Text style={styles.bold}>d'environ 2,1 litres d'eau par jour (70 kg x 30 ml/kg)</Text>.
                            {'\n\n'}

                            <Text style={[styles.bold, { paddingBottom: 40, }]}>Considérations supplémentaires</Text>
                            {'\n\n'}
                        </Text>
                        {conseils1.map((item, i) => (
                            <View key={i} style={styles.listItemContainer}>
                                {/* 1. La puce */}

                                <Text style={styles.bullet}>{'   '}{'\u2022'}</Text>
                                {/* 2) Le bloc titre+texte, WRAP et RETRAIT */}
                                <View style={styles.textBlock}>
                                    <Text style={styles.textBlockText}>
                                        {/* Titre en gras */}
                                        <Text style={styles.bold}>{item.title}</Text>
                                        {' '}
                                        <Text>{item.text}</Text>
                                    </Text>
                                </View>
                            </View>
                        ))}

                        <Text>  {'\n'} <Text style={[styles.paragraph, styles.bold]}>Conseils pratiques </Text> {'\n\n'}</Text>
                        {conseilsp.map((item, i) => (
                            <View key={i} style={styles.listItemContainer}>
                                {/* 1. La puce */}

                                <Text style={styles.bullet}>{'   '}{'\u2022'} {'  '}</Text>
                                {/* 2) Le bloc titre+texte, WRAP et RETRAIT */}
                                <View style={styles.textBlock}>
                                    <Text style={styles.textBlockText}>
                                        {/* Titre en gras */}
                                        <Text style={styles.bold}>{item.title}</Text>
                                        {' '}
                                        <Text>{item.text}</Text>
                                    </Text>
                                </View>
                            </View>
                        ))}
                        <Text style={styles.paragraph}>
                            {'\n'}
                            En conclusion, bien que les recommandations générales fournissent une estimation utile,
                            il est important d'ajuster votre consommation d'eau en fonction de vos besoins individuels et des facteurs mentionnés ci-dessus.

                            {'\n\n\n'}
                            Source:
                            {'\n'}
                            <Text
                                style={styles.link}
                                onPress={() => Linking.openURL('https://www.cieau.com/leau-et-votre-sante/eau-hydratation-et-hygiene/hydratation/boire-trop-deau-peut-il-nuire-a-la-sante/')}
                            >
                                Cieau
                            </Text>
                            {'\n'}
                            <Text
                                style={styles.link}
                                onPress={() => Linking.openURL('https://eaueska.ca/quelle-quantite-deau-devrait-on-boire-chaque-jour-blogue-eska/')}
                            >
                                Eau Eska
                            </Text>
                            {'\n\n\n'}

                        </Text>
                    </ScrollView>
                </View>
            )}
            {id === '110' && (
                <View>
                    <Image
                        source={require('../../assets/images/contenus/Rectangle_104.png')}
                        style={styles.background}
                        resizeMode="contain"
                    />
                    <ScrollView style={styles.textContainer}>
                        {/* 1. Au réveil */}
                        <Text style={styles.sectionHeader}>Répartition idéale de l'hydratation quotidienne</Text>

                        <Text style={styles.sectionHeader}>1. Au réveil</Text>
                        <View style={styles.listItemContainer}>
                            <Text style={styles.bullet}>{'   '}{'\u2022'}</Text>
                            <Text style={styles.listItemText}>
                                <Text style={styles.bold}>  Pourquoi :</Text> Après une nuit de sommeil, le corps est légèrement déshydraté.
                            </Text>
                        </View>
                        <View style={styles.listItemContainer}>
                            <Text style={styles.bullet}>{'   '}{'\u2022'}</Text>
                            <Text style={styles.listItemText}>
                                <Text style={styles.bold}>  Recommandation :</Text> Boire un verre d’eau (environ 250 ml) dès le matin pour réhydrater l’organisme.
                            </Text>
                        </View>

                        {/* 2. Avant et pendant les repas */}
                        <Text style={styles.sectionHeader}>2. Avant et pendant les repas</Text>
                        <View style={styles.listItemContainer}>
                            <Text style={styles.bullet}>{'   '}{'\u2022'}</Text>
                            <Text style={styles.listItemText}>
                                <Text style={styles.bold}>  Pourquoi :</Text> Boire de l’eau avant les repas peut aider à la digestion et à la satiété.
                            </Text>
                        </View>
                        <View style={styles.listItemContainer}>
                            <Text style={styles.bullet}>{'   '}{'\u2022'}</Text>
                            <Text style={styles.listItemText}>
                                <Text style={styles.bold}>  Recommandation :</Text> Consommer un verre d’eau (250 ml) environ 30 minutes avant chaque repas.
                            </Text>
                        </View>

                        {/* 3. Entre les repas */}
                        <Text style={styles.sectionHeader}>3. Entre les repas</Text>
                        <View style={styles.listItemContainer}>
                            <Text style={styles.bullet}>{'   '}{'\u2022'}</Text>
                            <Text style={styles.listItemText}>
                                <Text style={styles.bold}>  Pourquoi :</Text> Maintenir une hydratation constante tout au long de la journée est essentiel.
                            </Text>
                        </View>
                        <View style={styles.listItemContainer}>
                            <Text style={styles.bullet}>{'   '}{'\u2022'}</Text>
                            <Text style={styles.listItemText}>
                                <Text style={styles.bold}>  Recommandation :</Text> Boire régulièrement de petites quantités d’eau, par exemple 150 à 200 ml toutes les 2 à 3 heures.
                            </Text>
                        </View>

                        {/* 4. Pendant l’activité physique */}
                        <Text style={styles.sectionHeader}>4. Pendant l’activité physique</Text>
                        <View style={styles.listItemContainer}>
                            <Text style={styles.bullet}>{'   '}{'\u2022'}</Text>
                            <Text style={styles.listItemText}>
                                <Text style={styles.bold}>  Pourquoi :</Text> L’exercice augmente la perte de fluides par la sueur.
                            </Text>
                        </View>
                        <View style={styles.listItemContainer}>
                            <Text style={[styles.paragraph, styles.bold]}>
                                <Text style={styles.bullet}>{'   '}{'\u2022'}
                                </Text>  Recommandations  {'\n'}
                            </Text>
                        </View>

                        <View style={styles.rContainer}>
                            <View style={styles.listItemContainer}>
                                <Text style={styles.bullet}>{'   '}{'\u2022'}</Text>
                                <Text style={styles.listItemText}>
                                    <Text style={styles.bold}>  Avant l’exercice :</Text> Boire 500 ml d’eau 2 à 3 heures avant l’activité.
                                </Text>
                            </View>
                            <View style={styles.listItemContainer}>
                                <Text style={styles.bullet}>{'   '}{'\u2022'}</Text>
                                <Text style={styles.listItemText}>
                                    <Text style={styles.bold}>  Pendant l’exercice :</Text> Boire 200 à 300 ml toutes les 20 minutes.
                                </Text>
                            </View>
                            <View style={styles.listItemContainer}>
                                <Text style={styles.bullet}>{'   '}{'\u2022'}</Text>
                                <Text style={styles.listItemText}>
                                    <Text style={styles.bold}>  Après l’exercice :</Text> Remplacer les fluides perdus en buvant environ 500 ml pour chaque 0,5 kg de poids corporel perdu.
                                </Text>
                            </View>

                        </View>
                        {/* 5. En soirée */}
                        <Text style={styles.sectionHeader}>5. En soirée</Text>
                        <View style={styles.listItemContainer}>
                            <Text style={styles.bullet}>{'   '}{'\u2022'}</Text>
                            <Text style={styles.listItemText}>
                                <Text style={styles.bold}>  Pourquoi :</Text> Éviter les réveils nocturnes pour uriner.
                            </Text>
                        </View>
                        <View style={styles.listItemContainer}>
                            <Text style={styles.bullet}>{'   '}{'\u2022'}</Text>
                            <Text style={styles.listItemText}>
                                <Text style={styles.bold}>  Recommandation :</Text> Réduire la consommation de liquides 1 à 2 heures avant le coucher.
                            </Text>
                        </View>

                        {/* 6. Conseils pratiques */}
                        <Text style={styles.sectionHeader}>🧠 Conseils pratiques pour rester hydraté</Text>
                        <View style={styles.listItemContainer}>
                            <Text style={styles.bullet}>{'   '}{'\u2022'}</Text>
                            <Text style={styles.listItemText}>
                                <Text style={styles.bold}>  Écoutez votre corps :</Text> La sensation de soif est un indicateur fiable de vos besoins en eau.
                            </Text>
                        </View>
                        <View style={styles.listItemContainer}>
                            <Text style={styles.bullet}>{'   '}{'\u2022'}</Text>
                            <Text style={styles.listItemText}>
                                <Text style={styles.bold}>  Surveillez la couleur de votre urine :</Text> Une urine claire ou jaune pâle indique une bonne hydratation.
                            </Text>
                        </View>
                        <View style={styles.listItemContainer}>
                            <Text style={styles.bullet}>{'   '}{'\u2022'}</Text>
                            <Text style={styles.listItemText}>
                                <Text style={styles.bold}>  Utilisez des rappels :</Text> Des applications ou des alarmes peuvent vous aider à penser à boire régulièrement.
                            </Text>
                        </View>
                        <View style={styles.listItemContainer}>
                            <Text style={styles.bullet}>{'   '}{'\u2022'}</Text>
                            <Text style={styles.listItemText}>
                                <Text style={styles.bold}>  Consommez des aliments riches en eau :</Text> Les fruits et légumes comme la pastèque, le concombre et les fraises sont idéaux pour l’hydratation.
                            </Text>
                        </View>

                        <Text style={styles.paragraph}>

                            {'\n\n\n'}
                            Source:
                            {'\n'}
                            <Text
                                style={styles.link}
                                onPress={() => Linking.openURL('https://toutpourmasante.fr/combien-deau-par-jour/')}
                            >
                                Combien d'eau par jour : quelle quantité faut-il boire ?
                            </Text>
                            {'\n'}
                            <Text
                                style={styles.link}
                                onPress={() => Linking.openURL('https://www.canada.ca/en/department-national-defence/corporate/news/regional-news/western-sentinel/2021/08/facts-on-fluids-how-to-stay-hydrated.html')}
                            >
                                Facts on fluids: How to stay hydrated
                            </Text>
                            {'\n\n\n'}
                        </Text>
                    </ScrollView>
                </View>
            )}
        </ScrollView>
    );
}
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    background: {
        flex: 1,
        marginTop: 3,

        alignItems: 'center',
        padding: 40,
    },
    textContainer: {
        paddingHorizontal: 16,
        marginBottom: 4,
    },
    rContainer: {
        paddingHorizontal: 16,
        marginLeft: 4,
    },
    sectionHeader: {
        fontSize: 18,
        fontWeight: '600',
        marginTop: 16,
        marginBottom: 8,
    },
    paragraph: {
        fontSize: 16,
        lineHeight: 24,
        color: '#333',
    },
    bold: {
        fontWeight: 'bold',
    },
    listItemContainer: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 4,       // espace entre les items   
        paddingRight: 10,      // un peu de marge à droite si besoin
    },
    textBlock: {
        flex: 1,              // prend tout le reste de l’espace horizontal
    },
    textBlockText: {
        fontSize: 16,
        lineHeight: 25,
        color: '#333'
    },
    bullet: {
        width: 16,             // large assez pour la puce et un espace
        fontSize: 16,
        lineHeight: 24,
    },
    link: {
        color: '#1E90FF',       // bleu ou ta couleur de link
        textDecorationLine: 'underline',
    },
    listItemText: {
        flex: 1,
        fontSize: 16,
        lineHeight: 24,
        color: '#333',
    },
});