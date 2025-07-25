import Svg, { Path } from 'react-native-svg';

type BodyMapProps = {
    onSelect: (zone: string) => void;
    pains?: Record<string, { level: number }>;
  };

export default function BodyMapBack({ onSelect, pains = {} }: BodyMapProps ) {  
  // convertir niveau en couleur
  const getColor = (v: number) => {
    const r = Math.round((10 - v) * 25.5);
    const g = Math.round(v * 25.5);
    return `rgb(${r},${g},0)`;
  };

 const bodyPartProps: Record<string, { fill: string; onPress: () => void }> = {
    abdos: {
      fill: pains['Abdos'] ? getColor(pains['Abdos'].level) : '#E2E2E2',
      onPress: () => onSelect('Abdos'),
    },
    'avant-bras': {
      fill: pains['Avant-bras'] ? getColor(pains['Avant-bras'].level) : '#E2E2E2',
      onPress: () => onSelect('Avant-bras'),
    },
    biceps: {
      fill: pains['Biceps'] ? getColor(pains['Biceps'].level) : '#E2E2E2',
      onPress: () => onSelect('Biceps'),
    },
    carpe: {
      fill: pains['Carpe'] ? getColor(pains['Carpe'].level) : '#B4B4B4',
      onPress: () => onSelect('Carpe'),
    },
    'deltoide-droit': {
      fill: pains['Deltoïde Droit'] ? getColor(pains['Deltoïde Droit'].level) : '#B4B4B4',
      onPress: () => onSelect('Deltoïde Droit'),
    },
    'fessier-gauche': {
      fill: pains['Fessier Gauche'] ? getColor(pains['Fessier Gauche'].level) : '#B4B4B4',
      onPress: () => onSelect('Fessier Gauche'),
    },
    'fessier-droit': {
      fill: pains['Fessier-Droit'] ? getColor(pains['Fessier-Droit'].level) : '#B4B4B4',
      onPress: () => onSelect('Fessier-Droit'),
    },
    'grand-dorsal-gauche': {
      fill: pains['Grand Dorsal Gauche'] ? getColor(pains['Grand Dorsal Gauche'].level) : '#B4B4B4',
      onPress: () => onSelect('Grand Dorsal Gauche'),
    },
    'grand-rond-droit': {
      fill: pains['Grand Rond Droit'] ? getColor(pains['Grand Rond Droit'].level) : '#B4B4B4',
      onPress: () => onSelect('Grand Rond Droit'),
    },
    'grand-rond-gauche': {
      fill: pains['Grand Rond Gauche'] ? getColor(pains['Grand Rond Gauche'].level) : '#B4B4B4',
      onPress: () => onSelect('Grand Rond Gauche'),
    },
    'grand-dorsal-droit': {
      fill: pains['Grand Dorsal Droit'] ? getColor(pains['Grand Dorsal Droit'].level) : '#B4B4B4',
      onPress: () => onSelect('Grand Dorsal Droit'),
    },
    'tete': {
      fill: pains['Tête'] ? getColor(pains['Tête'].level) : '#E2E2E2',
      onPress: () => onSelect('Tête'),
    },
    'ischio-jambier': {
      fill: pains['Ischio-jambier'] ? getColor(pains['Ischio-jambier'].level) : '#B4B4B4',
      onPress: () => onSelect('Ischio-jambier'),
    },
    'long-extenseur': {
      fill: pains['Long Extenseur'] ? getColor(pains['Long Extenseur'].level) : '#E2E2E2',
      onPress: () => onSelect('Long Extenseur'),
    },
    main: {
      fill: pains['Main'] ? getColor(pains['Main'].level) : '#E2E2E2',
      onPress: () => onSelect('Main'),
    },
    'mollet-droit': {
      fill: pains['Mollet Droit'] ? getColor(pains['Mollet Droit'].level) : '#B4B4B4',
      onPress: () => onSelect('Mollet Droit'),
    },
    'mollet-gauche': {
      fill: pains['Mollet Gauche'] ? getColor(pains['Mollet Gauche'].level) : '#B4B4B4',
      onPress: () => onSelect('Mollet Gauche'),
    },
    oblique: {
      fill: pains['Oblique'] ? getColor(pains['Oblique'].level) : '#E2E2E2',
      onPress: () => onSelect('Oblique'),
    },
    'pied-droit': {
      fill: pains['Pied Droit'] ? getColor(pains['Pied Droit'].level) : '#B4B4B4',
      onPress: () => onSelect('Pied Droit'),
    },
    'pied-gauche': {
      fill: pains['Pied Gauche'] ? getColor(pains['Pied Gauche'].level) : '#B4B4B4',
      onPress: () => onSelect('Pied Gauche'),
    },
    'quadriceps': {
      fill: pains['Quadriceps'] ? getColor(pains['Quadriceps'].level) : '#E2E2E2',
      onPress: () => onSelect('Quadriceps'),
    },
    'tibiat-droit-1': {
      fill: pains['Tibiat Droit-1'] ? getColor(pains['Tibiat Droit-1'].level) : '#E2E2E2',
      onPress: () => onSelect('Tibiat Droit-1'),
    },
    'tibiat-droit': {
      fill: pains['Tibiat Droit'] ? getColor(pains['Tibiat Droit'].level) : '#E2E2E2',
      onPress: () => onSelect('Tibiat Droit'),
    },
    'tibiat-gauche-1': {
      fill: pains['Tibiat Gauche-1'] ? getColor(pains['Tibiat Gauche-1'].level) : '#E2E2E2',
      onPress: () => onSelect('Tibiat Gauche-1'),
    },
    'tibiat-gauche': {
      fill: pains['Tibiat Gauche'] ? getColor(pains['Tibiat Gauche'].level) : '#E2E2E2',
      onPress: () => onSelect('Tibiat Gauche'),
    },
    'trapeze': {
      fill: pains['Trapèze'] ? getColor(pains['Trapèze'].level) : '#B4B4B4',
      onPress: () => onSelect('Trapèze'),
    },
    'triceps': {
      fill: pains['Triceps'] ? getColor(pains['Triceps'].level) : '#B4B4B4',
      onPress: () => onSelect('Triceps'),
    },
  };

   return (
      <Svg 
        width="184" 
        height="346" 
        viewBox="0 0 184 346" 
        fill="none" 
        > 
        <Path 
            id="pied-gauche"
             d="M78.5346 303.214L69.092 304.035C69.092 307.648 69.6394 313.204 69.9131 315.53C69.2288 317.583 67.8604 322.099 67.8604 323.741C67.8604 325.794 70.7342 327.847 74.0186 327.847C76.6461 327.847 79.7663 327.299 80.9979 327.025C82.6401 325.931 86.335 323.495 87.9772 322.509C90.03 321.278 96.5987 323.331 99.4726 322.509C102.346 321.688 101.525 319.636 101.936 318.404C102.346 317.172 101.525 317.583 100.704 316.762C100.047 316.105 98.7883 317.035 98.2409 317.583L84.2823 312.246L78.5346 303.214Z" 
             stroke="white" 
             stroke-width="0.5"
              {...bodyPartProps['pied-gauche']}/>
        <Path 
            id="ischio-jambier"
             d="M89.2088 206.735C91.6721 221.925 70.7342 226.852 64.5759 227.673C89.2088 224.388 132.563 229.151 140.117 230.136C149.559 231.368 175.825 215.919 174.603 215.767C171.319 215.356 158.181 210.84 147.096 210.019C141.774 209.625 133.682 210.47 131.495 211.251C125.748 213.303 114.252 214.921 107.684 214.535C100.704 214.125 99.062 212.072 95.3671 209.608C92.9228 207.979 91.2616 206.735 89.2088 206.735Z" 
             stroke="white" 
             stroke-width="0.5"
            {...bodyPartProps['ischio-jambier']}/>
        <Path 
            id="deltoide-droit"
             d="M90.4405 78.2883L64.5759 83.2149C66.2181 87.3204 72.2742 95.9628 77.7135 99.2263C83.8717 102.921 86.7455 104.153 94.1354 114.006C93.9986 111.68 99.4725 102.006 99.4725 92.247C99.4725 85.6782 91.2616 78.4252 90.4405 78.2883Z" 
             stroke="white" 
             stroke-width="0.5"
            {...bodyPartProps['deltoide-droit']}/>
        <Path 
            id="grand-rond-droit"
             d="M74.0186 97.1719C74.0186 97.1719 72.3022 111.922 73.4274 115.921C71.4584 117.106 65.3606 118.767 57.5967 118.056C49.8328 117.345 46.7102 113.881 45.3037 111.66C47.8354 107.661 63.6351 85.7031 64.479 84.8145C64.479 84.8145 65.377 87.5789 70.0185 92.9107L74.0186 97.1719Z" 
             stroke="white" 
             stroke-width="0.5"
            {...bodyPartProps['grand-rond-droit']}/>
        <Path 
            id="grand-rond-gauche"
             d="M5.84299 93.5139C5.84299 93.5139 3.82892 95.5847 1.7203 103.359C6.02186 106.544 5.95978 108.775 9.50973 109.529C11.8202 110.02 20.6665 108.708 22.7193 107.399C22.1401 103.054 17.546 82.6396 17.1798 81.5638C17.1798 81.5638 15.1539 81.136 13.9591 81.5638L5.84299 93.5139Z" 
             stroke="white" 
             stroke-width="0.5"
            {...bodyPartProps['grand-rond-gauche']}/>
        <Path 
            id="grand-dorsal-droit" 
            d="M66.1834 185.804C45.7299 187.509 34.9677 205.913 32.0939 211.797C28.399 192.912 22.5578 178.481 29.5372 132.966L44.8775 111.66C45.9723 113.712 49.7785 117.821 57.661 118.478C65.5436 119.134 71.8007 117.442 73.8535 116.347C73.6445 118.515 74.2796 120.608 74.7057 121.886C75.3868 123.93 75.9841 125.295 77.2625 128.704C78.5408 132.113 79.393 135.522 80.2453 137.227C76.5523 141.062 70.4446 153.419 69.5923 155.55C68.7401 157.68 66.3254 165.35 64.905 170.038C62.4417 176.196 64.5412 182.93 66.1834 185.804Z" 
            stroke="white"
            stroke-width="0.5"
           {...bodyPartProps['grand-dorsal-droit']}/>
        <Path 
            id="fessier-droit"
             d="M43.6378 198.168C37.6896 204.116 33.1004 210.485 31.7319 213.358L34.1952 222.801C35.9743 227.043 45.9369 233.64 71.5551 226.085C97.1734 218.531 89.3456 201.589 82.2294 194.063C77.9871 190.368 63.5905 185.277 54.7227 189.547C51.8488 190.93 47.7433 194.063 43.6378 198.168Z" 
             stroke="white" 
             stroke-width="0.5"
            {...bodyPartProps['fessier-droit']}/>

        <Path 
            id="quadriceps"
             d="M129.853 211.716C97.3083 219.687 98.6517 208.514 88.7986 206.324C85.1036 194.418 80.0128 191.873 74.4294 189.902C68.8459 187.932 61.7024 187.85 58.418 187.85L84.5064 183.674C104.96 184.1 127.801 188.726 141.349 191.6C157.747 195.078 170.498 204.682 174.603 215.767C164.339 226.441 149.97 206.79 129.853 211.716Z" 
             stroke="white" 
             stroke-width="0.5"
            {...bodyPartProps['quadriceps']}/>
        <Path 
            id="oblique"
             d="M64.9052 173.873C64.1564 177.071 65.5306 183.615 67.0359 185.804L84.5065 182.821C84.6434 178.99 82.7248 171.742 77.6889 167.481C73.4192 163.868 71.3873 159.108 70.0188 155.55C67.8882 163.22 65.7134 170.421 64.9052 173.873Z" 
             stroke="white" 
             stroke-width="0.5"
            {...bodyPartProps['oblique']}/>
        <Path 
            id="triceps"
             d="M74.8395 97.1182L74.8394 97.1182C72.7867 109.435 73.6078 111.487 74.4292 118.467C74.9282 122.707 83.461 140.636 90.4403 166.911L97.0093 175.122L99.0621 161.574L94.1352 113.54C91.8088 110.666 87.238 105.247 84.2821 103.276C79.3555 99.992 76.3448 98.0761 74.8395 97.1182Z" 
             stroke="white" 
             stroke-width="0.5"
            {...bodyPartProps['triceps']}/>
        <Path 
            id="avant-bras"
             d="M110.557 154.185L109.736 161.985L133.138 189.902L141.349 191.544L147.507 190.723C139.706 186.207 133.959 184.976 129.032 177.586C124.306 170.496 113.842 158.153 110.557 154.185Z" 
             stroke="white" 
             stroke-width="0.5"
            {...bodyPartProps['avant-bras']}/>
        <Path 
            id="long-extenseur"
             d="M99.4729 162.396L116.716 187.439L133.138 189.902L109.737 161.575L94.1357 112.719L99.4729 162.396Z" 
             stroke="white" 
             stroke-width="0.5"
            {...bodyPartProps['long-extenseur']}/>
        <Path 
            id="mollet-gauche"
             d="M165.981 221.104C161.465 223.156 150.244 227.809 144.633 229.725C140.527 232.188 136.833 269.548 136.833 275.296C136.833 279.894 136.833 296.645 129.443 326.615C142.58 322.099 144.633 284.328 160.644 267.085C172.016 254.839 171.293 218.689 165.981 221.104Z" 
             stroke="white" 
             stroke-width="0.5"
            {...bodyPartProps['mollet-gauche']}/>
        <Path 
            id="carpe"
             d="M97.0091 175.123L90.8508 167.322L95.3669 175.123L104.809 185.797L116.715 187.439L99.0618 161.575L97.0091 175.123Z" 
             stroke="white" 
             stroke-width="0.5"
            {...bodyPartProps['carpe']}/>
        <Path 
            id="biceps"
             d="M99.2187 92.9901C99.8443 97.2632 96.0907 107.743 94.1357 112.448L109.776 161.666L110.558 153.653C106.517 131.652 98.5931 88.717 99.2187 92.9901Z" 
             stroke="white" 
             stroke-width="0.5"
            {...bodyPartProps['biceps']}/>
        <Path 
            id="mollet-gauche"
             d="M69.0923 227.262L62.5235 228.494C60.7445 235.473 59.9775 250.334 64.5761 260.106C68.2469 267.906 64.9867 283.097 71.1449 304.035C77.3031 286.792 74.3471 269.795 78.9453 259.285C83.5434 248.775 87.9773 227.673 85.9246 226.441L69.0923 227.262Z" 
             stroke="white" 
             stroke-width="0.5"
            {...bodyPartProps['mollet-gauche']}/>
        <Path 
            id="tibiat_droit-1"
             d="M166.803 221.104C169.54 219.599 174.603 216.424 174.603 215.767C174.603 214.946 177.477 218.23 177.477 223.567C177.477 228.904 174.192 251.485 171.319 258.053C168.445 264.622 146.686 313.067 143.812 322.92L130.319 326.39C130.005 326.49 129.712 326.561 129.443 326.615L130.319 326.39C132.391 325.725 135.365 323.759 138.475 316.762C143.401 305.677 149.735 279.812 158.181 269.959C168.034 258.464 166.803 254.358 168.445 248.2C170.196 241.631 170.908 223.978 166.803 221.104Z" 
             stroke="white" 
             stroke-width="0.5"
            {...bodyPartProps['tibiat_droit-1']}/>
        <Path 
            id="tibiat_droit"
             d="M136.832 272.012C132.727 289.665 130.675 311.014 129.443 326.615C129.326 328.09 136.832 302.803 136.832 272.012Z" 
             stroke="white" 
             stroke-width="0.5"
            {...bodyPartProps['tibiat_droit']}/>
        <Path 
            id="pied-droit"
             d="M143.809 322.92L129.44 327.025C126.977 329.626 125.337 334.087 125.337 336.057C125.337 338.521 124.105 335.647 126.979 341.805C128.704 345.5 138.472 345.911 143.809 343.447C150.378 343.721 173.941 344.104 179.524 343.447C186.504 342.626 180.759 336.057 179.937 336.057H175.834L143.809 322.92Z" 
             stroke="white" 
             stroke-width="0.5"
            {...bodyPartProps['pied-droit']}/>

        <Path 
            id="tibiat-gauche"
             d="M78.945 303.624L71.5552 304.035C74.5111 296.152 75.5238 285.423 75.6607 281.044C76.0712 273.243 76.7862 263.535 80.1767 256C83.8716 247.789 85.9244 231.094 85.9244 226.441H90.0299C91.6721 231.368 85.1033 260.927 83.0505 267.906C81.4083 273.49 79.6293 294.045 78.945 303.624Z" 
             stroke="white" 
             stroke-width="0.5"
            {...bodyPartProps['tibiat-gauche']}/>
        <Path 
            id="tibiat-gauche-1"
             d="M63.3444 277.349C65.315 283.918 67.8604 297.603 68.6815 304.035H71.1448C70.4606 301.435 68.9279 295.742 68.271 290.487C67.4499 283.918 66.2182 269.959 66.2182 266.264C66.2182 262.569 65.3972 261.748 63.3444 257.232C61.7022 253.619 61.2916 248.884 61.2916 246.969C61.1548 254.358 61.3738 270.78 63.3444 277.349Z" 
             stroke="white" 
             stroke-width="0.5"              
             {...bodyPartProps['tibiat-gauche-1']}/>

        <Path 
            id="grand-dorsal-gauche"
             d="M10.3835 110.256C15.6385 110.256 20.2562 109.209 22.7195 108.251L28.259 132.966C21.2797 183.053 27.1519 189.628 31.668 211.797C28.712 201.944 17.4939 198.127 10.7882 193.474C12.4304 190.601 12.8468 176.354 12.8468 169.786C12.8468 163.217 5.4569 122.983 1.76196 103.687C2.17251 103.961 3.23994 104.837 4.22525 106.151C5.4569 107.793 7.09909 110.256 10.3835 110.256Z" 
             stroke="white" 
             stroke-width="0.5"
              {...bodyPartProps['grand-dorsal-gauche']}/>
        <Path 
            id="fessier-gauche"
             d="M30.5007 210.43C32.1672 213.135 31.7324 218.64 36.2484 225.62C24.3892 232.256 6.30907 228.543 2.93621 221.147C-0.522792 213.563 9.3481 193.56 10.7945 194.418C25.3851 203.074 26.8531 204.507 30.5007 210.43Z" 
             stroke="white" 
             stroke-width="0.5"
              {...bodyPartProps['fessier-gauche']}/>
        <Path 
            id="tete" 
            d="M67.0398 61.8111L67.0398 68.7905L58.8287 65.5061L55.955 50.3158L43.6387 66.3272L42.8176 58.1162L41.586 48.6736L38.3016 44.1576C38.3016 44.1576 33.375 38.8204 32.5539 32.6622C32.0065 28.5567 32.8825 21.6595 34.1962 17.0614C35.51 12.4632 38.7121 7.61873 40.7648 5.97654L40.7703 5.97276C42.5528 4.73869 46.9331 1.70617 56.7762 1.04996C66.6294 0.393081 74.4297 6.38708 77.3036 8.85038C79.0826 11.3137 81.0068 13.0087 82.2301 20.7563C83.4618 28.5567 79.63 31.2937 80.1774 33.0727C81.409 35.536 80.9985 37.9993 80.5881 41.2837C80.1808 44.5428 75.6612 63.0428 74.4296 63.0428C71.7816 63.0428 68.8189 62.7691 67.0398 61.8111Z" 
            stroke="white" 
            stroke-width="0.5"
            {...bodyPartProps['tete']}/>
        <Path 
            id="trapeze"
             d="M14.4893 81.1071L35.8378 65.5612L41.996 48.2632L44.0487 65.5612L56.3652 49.9054L58.8285 65.5612L90.8513 78.2332L64.9867 83.1598L47.7437 106.561L28.8585 132.891L17.7736 81.1071H14.4893Z" 
             stroke="white" 
             stroke-width="0.5"
              {...bodyPartProps['trapeze']}/>
        <Path 
            id="main"
             d="M146.686 190.723L141.349 191.544C150.216 193.843 155.718 196.608 157.36 197.702C157.032 193.104 150.107 191.134 146.686 190.723Z" 
             stroke="white" 
             stroke-width="0.5"
              {...bodyPartProps['main']}/>
        <Path 
            id="abdos"
             d="M84.9326 153.419C83.1453 140.909 80.6714 139.44 80.6714 137.653C79.393 139.215 76.9216 143.278 75.558 145.323C74.1944 147.368 71.4389 152.709 70.4446 155.124C72.6786 160.039 74.0604 163.526 79.4221 167.994C82.103 171.122 84.9326 174.779 84.9326 182.821H86.2109C86.9258 181.749 85.2304 159.526 84.9326 153.419Z" 
             stroke="white" 
             stroke-width="0.5"
              {...bodyPartProps['abdos']}/>
        </Svg>
    );
  
}
