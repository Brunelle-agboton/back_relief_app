import Svg, { Path } from 'react-native-svg';

type BodyMapProps = {
    onSelect: (zone: string) => void;
    pains?: Record<string, { level: number }>;
  };

export default function BodyMapFront({ onSelect, pains = {} }: BodyMapProps ) {  
  // convertir niveau en couleur
  const getColor = (v: number) => {
    const r = Math.round((10 - v) * 25.5);
    const g = Math.round(v * 25.5);
    return `rgb(${r},${g},0)`;
  };

 const bodyPartProps: Record<string, { fill: string; onPress: () => void }> = {
    abdos: {
      fill: pains['Abdos Lateral'] ? getColor(pains['Abdos Lateral'].level) : '#E2E2E2',
      onPress: () => onSelect('Abdos Lateral'),
    },
    'avant-bras-droit': {
      fill: pains['Avant Bras Droit'] ? getColor(pains['Avant Bras Droit'].level) : '#E2E2E2',
      onPress: () => onSelect('Avant Bras Droit'),
    },
     'avant-bras-gauche': {
      fill: pains['Avant Bras Gauche'] ? getColor(pains['Avant Bras Gauche'].level) : '#E2E2E2',
      onPress: () => onSelect('Avant Bras Gauche'),
    },
    "biceps-gauche": {
      fill: pains['Biceps Gauche'] ? getColor(pains['Biceps Gauche'].level) : '#E2E2E2',
      onPress: () => onSelect('Biceps Gauche'),
    },"biceps-droit": {
      fill: pains['Biceps Droit'] ? getColor(pains['Biceps Droit'].level) : '#E2E2E2',
      onPress: () => onSelect('Biceps Droit'),
    },
    'deltoide-droit-lateral': {
      fill: pains['Deltoïde Droit Lateral'] ? getColor(pains['Deltoïde Droit Lateral'].level) : '#E2E2E2',
      onPress: () => onSelect('Deltoïde Droit Lateral'),
    },
    'deltoide-gauche-lateral': {
      fill: pains['Deltoïde Gauche Lateral'] ? getColor(pains['Deltoïde Gauche Lateral'].level) : '#E2E2E2',
      onPress: () => onSelect('Deltoïde Gauche Lateral'),
    },
    'fessier-gauche-lateral': {
      fill: pains['Fessier Gauche Lateral'] ? getColor(pains['Fessier Gauche Lateral'].level) : '#B4B4B4',
      onPress: () => onSelect('Fessier Gauche Lateral'),
    },
    'biceps-femoral-droit': {
      fill: pains['Bicesps Femoral Droit'] ? getColor(pains['Bicesps Femoral Droit'].level) : '#B4B4B4',
      onPress: () => onSelect('Bicesps Femoral Droit'),
    },
    'biceps-femoral-gauche': {
      fill: pains['Bicesps Femoral Gauche'] ? getColor(pains['Bicesps Femoral Gauche'].level) : '#B4B4B4',
      onPress: () => onSelect('Bicesps Femoral Gauche'),
    },
    'pectoral-droit': {
      fill: pains['Pectoral Droit'] ? getColor(pains['Pectoral Droit'].level) : '#B4B4B4',
      onPress: () => onSelect('Pectoral Droit'),
    },
    'pectoral-gauche': {
      fill: pains['Pectoral Gauche'] ? getColor(pains['Pectoral Gauche'].level) : '#B4B4B4',
      onPress: () => onSelect('Pectoral Gauche'),
    },
    'intercostaux': {
      fill: pains['Intercostaux'] ? getColor(pains['Intercostaux'].level) : '#B4B4B4',
      onPress: () => onSelect('Intercostaux'),
    },
    'tete-face': {
      fill: pains['Tête Face'] ? getColor(pains['Tête Face'].level) : '#E2E2E2',
      onPress: () => onSelect('Tête Face'),
    },
    "main-gauche": {
      fill: pains['Main Gauche'] ? getColor(pains['Main Gauche'].level) : '#E2E2E2',
      onPress: () => onSelect('Main Gauche'),
    },
    "main-droite": {
      fill: pains['Main Droite'] ? getColor(pains['Main Droite'].level) : '#E2E2E2',
      onPress: () => onSelect('Main Droite'),
    },
    'tibiat-gauche-lateral': {
      fill: pains['Tibiat Gauche Lateral'] ? getColor(pains['Tibiat Gauche Lateral'].level) : '#B4B4B4',
      onPress: () => onSelect('Tibiat Gauche Lateral'),
    },
    'tibiat-gauche-lateral-1': {
      fill: pains['Tibiat Gauche Lateral 1'] ? getColor(pains['Tibiat Gauche Lateral 1'].level) : '#B4B4B4',
      onPress: () => onSelect('Tibiat Gauche Lateral 1'),
    },
    tronc: {
      fill: pains['Tronc'] ? getColor(pains['Tronc'].level) : '#E2E2E2',
      onPress: () => onSelect('Tronc'),
    },
    'supinateur-droit': {
      fill: pains['Supinateur-Droit'] ? getColor(pains['Supinateur-Droit'].level) : '#B4B4B4',
      onPress: () => onSelect('Supinateur-Droit'),
    },
    'supinateur-gauche': {
      fill: pains['Supinateur Gauche'] ? getColor(pains['Supinateur Gauche'].level) : '#B4B4B4',
      onPress: () => onSelect('Supinateur Gauche'),
    },
    'pied-droit-anterieur': {
      fill: pains['Pied Droit Anterieur'] ? getColor(pains['Pied Droit Anterieur'].level) : '#B4B4B4',
      onPress: () => onSelect('Pied Droit Anterieur'),
    },
    'pied-gauche-anterieur': {
      fill: pains['Pied Gauche Anterieur'] ? getColor(pains['Pied Gauche '].level) : '#B4B4B4',
      onPress: () => onSelect('Pied Gauche Anterieur'),
    },
    'quadriceps-droit': {
      fill: pains['Quadriceps Droit'] ? getColor(pains['Quadriceps Droit'].level) : '#E2E2E2',
      onPress: () => onSelect('Quadriceps Droit'),
    },
    'quadriceps-gauche': {
      fill: pains['Quadriceps Gauche'] ? getColor(pains['Quadriceps Gauche'].level) : '#E2E2E2',
      onPress: () => onSelect('Quadriceps Gauche'),
    },
    'tibiat-droit-1': {
      fill: pains['Tibiat Droit-1'] ? getColor(pains['Tibiat Droit-1'].level) : '#E2E2E2',
      onPress: () => onSelect('Tibiat Droit-1'),
    },
    'tibiat-droit': {
      fill: pains['Tibiat Droit'] ? getColor(pains['Tibiat Droit'].level) : '#E2E2E2',
      onPress: () => onSelect('Tibiat Droit'),
    },
    'tibiat-gauche': {
      fill: pains['Tibiat Gauche'] ? getColor(pains['Tibiat Gauche'].level) : '#B4B4B4',
      onPress: () => onSelect('Tibiat Gauche'),
    },
    'tibiat-anterieur-gauche': {
      fill: pains['Tibiat Anterieur Gauche'] ? getColor(pains['Tibiat Anterieur Gauche'].level) : '#E2E2E2',
      onPress: () => onSelect('Tibiat Anterieur Gauche'),
    },
    'triceps-gauche': {
      fill: pains['Triceps Gauche'] ? getColor(pains['Triceps Gauche'].level) : '#B4B4B4',
      onPress: () => onSelect('Triceps Gauche'),
    },
    'triceps-droit': {
      fill: pains['Triceps Droit'] ? getColor(pains['Triceps Droit'].level) : '#B4B4B4',
      onPress: () => onSelect('Triceps Droit'),
    },
     'tibiat-anterieur-droit': {
      fill: pains['Tibiat Droit'] ? getColor(pains['Tibiat Anterieur Droit'].level) : '#E2E2E2',
      onPress: () => onSelect('Tibiat Anterieur Droit'),
    },
  };
   return (
      <Svg width="222" height="352" viewBox="0 0 222 352" fill="none">
      <Path 
         id="quadriceps-gauche"
        d="M84.7936 224.29C84.0822 214.686 92.2044 207.838 96.3544 205.615C95.0205 208.727 96.3544 210.061 98.5777 210.061C100.801 210.061 109.694 210.506 115.474 211.395C121.255 212.285 130.148 210.061 133.705 208.727C136.551 207.66 140.226 207.986 141.708 208.283C147.044 207.927 152.232 203.392 154.159 201.168C158.012 199.39 167.943 195.744 176.836 195.388C185.729 195.032 191.212 192.572 192.843 191.386C194.325 196.129 195.333 207.66 187.507 215.842C177.725 226.069 116.808 225.624 111.472 226.069C106.137 226.513 101.246 221.177 99.9116 220.733C98.5777 220.288 96.3544 225.179 94.1312 227.403C92.3526 229.181 88.3508 230.515 86.5722 230.96C86.2758 232.738 85.505 233.894 84.7936 224.29Z"         
        stroke="white"
        {...bodyPartProps['quadriceps-droit']}/>
      <Path 
        id="tibiat-gauche"
        d="M61.2274 231.404H65.2292C66.2667 232.59 68.6083 237.807 69.6755 249.19C71.0094 263.419 68.7862 266.087 65.2292 274.535C61.6722 282.983 63.0058 298.546 63.0058 306.105C63.0058 311.532 64.1994 317.126 64.9799 319.93C65.0909 320.206 65.1747 320.488 65.229 320.778C65.153 320.535 65.0692 320.251 64.9799 319.93C62.9131 314.797 51.4319 312.144 45.6646 311.441C51.0003 288.764 47.4433 259.417 46.554 249.19C45.8426 241.009 56.0398 233.924 61.2274 231.404Z" 
        stroke="white"
        {...bodyPartProps['tibiat-gauche']}/>
      <Path 
        id="tibiat-anterieur-droit"
        d="M33.2144 232.738C31.7916 229.893 31.1394 224.142 30.9912 221.622C36.6827 220.555 39.2913 216.731 39.8842 214.952C43.0856 229.893 56.6325 232.145 63.0058 231.404C56.7807 232.886 44.8642 239.23 46.9985 252.747C49.6664 269.644 47.8878 314.553 45.2199 311.441C43.0856 308.951 39.5877 309.81 38.1056 310.552C42.9967 303.437 36.327 278.982 33.2144 262.974C30.7244 250.168 32.1769 241.928 33.2144 239.408C33.8073 238.37 34.6373 235.584 33.2144 232.738Z" 
        stroke="white"
        {...bodyPartProps['tibiat-anterieur-droit']}/>
      <Path 
        id="intercostaux"
        d="M178.169 168.264C175.946 170.488 169.988 175.646 163.941 178.491C164.682 176.12 166.164 169.332 166.164 161.15C166.164 150.923 152.38 133.582 163.051 134.471C171.589 135.183 182.616 124.689 187.062 119.353C183.505 132.871 189.434 151.368 192.843 158.927C189.286 160.35 181.578 165.745 178.169 168.264Z" 
        stroke="white"
       {...bodyPartProps['intercostaux']}/>
      <Path 
        id="abdos"
        d="M144.821 130.914C152.291 133.76 157.716 134.471 159.494 134.471C156.382 136.695 160.384 144.254 162.607 149.145C164.83 154.036 166.164 158.927 166.164 163.374C166.164 166.931 164.978 174.934 164.385 178.492C156.204 182.404 146.451 186.051 142.598 187.384L134.594 186.495C132.46 183.294 133.705 175.675 134.594 172.266C135.483 168.561 136.373 159.55 132.815 153.147C129.258 146.744 128.665 136.547 128.814 132.248C133.438 133.315 141.412 131.804 144.821 130.914Z" 
       stroke="white"
       {...bodyPartProps['abdos']}/>
      <Path 
        id="main-droite"
        d="M36.3268 192.72C42.0183 184.894 55.2984 180.27 61.2271 178.936L71.8987 187.384C72.2545 193.076 67.3041 195.981 64.7844 196.722C61.3754 197.315 53.4014 198.501 48.7771 198.501C44.1528 198.501 34.4001 206.504 30.1018 210.506C29.8053 207.838 30.6353 200.546 36.3268 192.72Z" 
       stroke="white"
       {...bodyPartProps['main-droite']}/>
      <Path 
        id="supinateur-droit"
        d="M72.3436 189.163C73.0551 187.74 72.0472 187.384 71.4543 187.384C73.8258 184.865 79.458 179.114 83.0152 176.268C87.4615 172.711 90.574 170.932 93.6865 169.154L93.6867 169.154C96.1767 167.731 101.542 165.3 103.914 164.263C107.767 161.298 115.208 155.636 114.14 156.704C113.073 157.771 116.067 161.595 117.698 163.373C119.624 164.411 123.033 167.375 121.255 170.932C119.476 174.489 112.214 179.232 108.805 181.159C103.024 183.234 89.7738 187.384 83.0152 187.384C76.2565 187.384 73.0847 188.57 72.3436 189.163Z" 
      stroke="white"
      {...bodyPartProps['supinateur-droit']}/>
      <Path 
        id="biceps-droit"
        d="M111.028 132.248C112.807 127.624 119.476 117.575 122.589 113.128C122.589 124.867 126.739 130.47 128.814 131.804C127.035 136.398 123.3 146.032 122.589 147.811C121.7 150.034 116.364 156.704 114.141 156.704C112.362 156.704 109.842 159.372 108.805 160.706C109.516 158.216 107.619 151.665 106.582 148.7C107.323 145.143 109.249 136.873 111.028 132.248Z" 
        stroke="white"
      {...bodyPartProps['biceps-droit']}/>
      <Path 
        id="triceps-droit"
        d="M118.587 163.818C114.318 160.617 113.844 157.741 114.141 156.704C123.923 153.147 128.765 130.915 128.814 132.693C129.259 148.7 132.371 151.368 132.371 152.257C132.371 159.575 123.22 168.818 119.942 173.57C121.271 171.626 122.834 167.003 118.587 163.818Z" 
        stroke="white"
        {...bodyPartProps['triceps-droit']}/>
      <Path 
        id="avant-bras-droit"
        d="M108.805 159.816C109.16 156.971 107.471 151.22 106.581 148.7C105.247 151.368 99.4671 153.591 95.4653 155.37C92.2638 156.793 88.2027 160.706 86.5723 162.484C80.6437 166.783 68.3418 175.29 66.5632 174.934C64.7846 174.579 61.6721 177.158 60.3381 178.492L71.4543 186.94C74.4186 184.272 81.5923 177.869 86.5723 173.6C92.7974 168.265 108.36 163.374 108.805 159.816Z" 
        stroke="white"
      {...bodyPartProps['avant-bras-droit']}/>
      <Path 
        id="main-gauche"
        d="M118.587 186.495C123.211 185.072 137.114 186.791 143.487 187.829C146.599 188.3 156.382 197.611 153.714 201.613C151.58 204.814 145.414 207.393 142.598 208.283C140.523 207.986 135.484 207.749 131.926 209.172C128.369 210.595 120.366 211.543 116.808 211.84C113.992 211.247 106.848 210.061 100.801 210.061C93.2419 210.061 97.2437 205.615 97.2437 205.17C97.2437 204.725 112.806 188.274 118.587 186.495Z" 
        stroke="white"
       {...bodyPartProps['main-gauche']}/>
      <Path 
        id="avant-bras-gauche"
        d="M167.943 175.824C161.184 180.804 148.23 185.606 142.598 187.384C150.068 190.942 152.232 194.795 152.38 196.277C165.423 192.868 193.021 185.428 199.068 182.938C206.627 179.825 206.627 174.045 207.961 170.933C209.028 168.443 212.556 165.745 214.186 164.707C213.593 163.67 212.496 160.972 212.852 158.482C213.297 155.37 212.408 151.368 210.629 147.811C209.206 144.965 208.257 141.882 207.961 140.697C203.959 158.038 200.402 156.704 194.177 158.482C187.952 160.261 176.391 169.599 167.943 175.824Z" 
        stroke="white"
        {...bodyPartProps['avant-bras-gauche']}/>
      <Path 
        id="pectoral-droit"
        d="M151.491 92.2302C149.001 89.0287 141.56 88.5248 140.375 89.1176C125.257 97.1213 123.478 108.237 123.033 112.684C122.589 117.13 123.478 132.693 131.926 132.693C138.685 132.693 144.08 132.248 144.821 130.025C145.414 126.172 144.463 116.368 144.821 111.35C145.266 105.125 150.008 95.7873 151.491 92.2302Z" 
        stroke="white"
      {...bodyPartProps['pectoral-droit']}/>
      <Path 
        id="pectoral-gauche"
        d="M144.821 112.239C144.673 108.089 145.127 97.1901 151.491 94.0084C155.048 92.2298 158.605 90.8959 162.607 90.0066C165.776 89.3023 174.873 86.0703 178.937 85.1429C178.979 85.1311 179.019 85.122 179.059 85.1155C179.019 85.1244 178.978 85.1335 178.937 85.1429C178.033 85.3979 176.6 86.9201 177.28 91.3405C177.991 95.9649 184.987 107.792 188.396 113.128L186.173 119.798C182.764 124.689 173.367 134.471 163.051 134.471C152.736 134.471 145.858 132.1 144.821 130.469C143.795 128.246 143.426 120.776 144.821 112.239Z" 
        stroke="white"
      {...bodyPartProps['pectoral-gauche']}/>
      <Path 
        id="tete-face"
        d="M126.146 17.974C128.992 3.03385 149.564 0.484543 159.495 1.07741C183.328 5.70174 181.579 29.9795 177.725 41.5403L163.496 48.21C161.718 55.769 163.496 53.7928 161.718 55.769C153.714 64.6619 137.707 68.2191 134.15 67.3298C131.304 66.6184 129.958 68.2191 129.258 64.6619C127.48 55.6208 123.3 32.9141 126.146 17.974Z" 
        stroke="white"
      {...bodyPartProps['tete-face']}/>
      <Path 
        id="tronc"
        d="M146.155 75.3334L142.153 66.4405C154.603 63.5947 160.977 57.5475 162.607 54.8796L163.941 47.7653L176.391 41.9849C174.613 43.3188 173.279 50.8778 174.168 54.8796C175.057 58.8815 178.614 64.2172 187.063 68.219C193.821 71.4205 203.07 78.7424 204.404 81.1138C188.752 81.1138 161.421 90.4514 151.491 93.5639C151.491 91.0739 136.077 85.5603 130.593 84.671C136.284 84.671 144.377 77.8531 146.155 75.3334Z" 
        stroke="white"
        {...bodyPartProps['tronc']}/>
      <Path 
        id="deltoide-droit-lateral" 
        d="M117.698 102.901C118.765 91.5185 126.442 86.5977 131.482 84.6709C137.262 86.0048 142.598 88.2281 142.153 88.6727C141.709 89.1174 133.26 93.1192 128.814 98.0103C125.257 101.923 123.033 110.016 123.033 112.239L117.698 120.243C117.698 116.241 116.364 117.13 117.698 102.901Z" 
        stroke="white"
      {...bodyPartProps['deltoide-droit-lateral']}/>
      <Path 
        id="deltoide-gauche-lateral" 
        d="M179.948 98.8995C174.968 91.0737 177.873 86.4494 179.948 85.1155C186.025 83.4851 199.424 80.4022 204.404 81.1136C209.384 81.8251 211.814 84.9673 212.407 86.4494C219.077 94.0084 219.966 102.901 219.966 107.348C219.966 111.794 215.52 118.019 210.629 121.132C206.716 123.622 203.514 129.877 202.181 132.693C202.625 127.802 199.068 127.357 190.62 116.241C182.171 105.125 186.173 108.682 179.948 98.8995Z" 
      stroke="white"
      {...bodyPartProps['deltoide-gauche-lateral']}/>
      <Path 
        id="biceps-gauche" 
        d="M192.842 158.927C183.505 137.584 185.432 123.059 188.396 114.018C190.619 116.685 195.777 122.822 198.623 126.023C201.469 129.225 202.18 131.211 202.18 131.803C204.67 127.535 207.664 123.948 208.85 122.466C208.702 126.468 208.316 135.094 207.961 139.362C207.516 144.698 205.293 153.147 200.846 156.259C198.514 157.892 194.028 158.186 192.842 158.927Z" 
        stroke="white"
        {...bodyPartProps['biceps-gauche']}/>
      <Path 
        id="supinateur-gauche" 
        d="M154.159 201.168C154.159 197.931 153.863 197.759 152.825 196.277C155.493 194.499 188.397 187.384 199.068 182.938C207.881 179.266 206.183 174.934 207.517 171.377C208.584 168.531 212.259 166.338 214.186 165.152C214.779 167.375 216.532 171.622 217.743 174.045C218.188 174.934 218.633 176.713 216.854 179.381C215.075 182.049 194.177 190.942 188.397 193.165C182.616 195.388 172.39 195.388 167.054 196.722C161.718 198.056 154.159 201.613 154.159 201.168Z" 
      stroke="white"
      {...bodyPartProps['supinateur-gauche']}/>
      <Path 
        id="quadriceps-droit" 
        d="M71.454 190.942C81.4141 188.096 104.506 188.274 114.585 188.718C107.139 194.412 102.282 199.675 97.0384 205.356L96.7989 205.615C92.1746 206.682 88.647 211.988 87.4613 214.508C87.0167 215.101 84.1709 216.287 76.3451 216.287C66.5629 216.287 70.1201 216.287 56.336 218.065C50.7038 219.547 39.6173 220.377 40.3287 211.84C39.884 214.804 37.4829 220.822 31.4357 221.178C30.6946 218.658 29.6571 212.818 31.4357 209.617C33.2143 206.415 43.1448 200.872 47.8877 198.501C69.5865 197.789 72.6397 193.165 71.454 190.942Z" 
      stroke="white"
      {...bodyPartProps['quadriceps-droit']}/>

      <Path 
        id="biceps-femoral-droit" 
        d="M60.3383 218.065C55.299 219.547 39.8845 219.844 39.8845 214.952C44.7756 228.736 50.1114 230.96 59.0043 231.404C67.8973 231.849 79.9028 229.181 83.9046 233.628C84.201 228.292 85.2385 217.087 87.0171 214.952C85.6832 215.397 81.1478 216.286 73.6777 216.286C66.2076 216.286 61.6722 217.472 60.3383 218.065Z" 
      stroke="white"
       {...bodyPartProps['biceps-femoral-droit']}/>
      <Path 
        id="fessier-gauche-lateral" 
        d="M201.736 187.829L192.843 191.386C196.4 201.168 191.509 214.063 184.395 218.51C182.616 219.621 179.059 225.179 179.059 229.626C187.507 232.738 182.171 235.505 188.841 234.517C200.847 232.738 203.07 225.624 205.293 210.951C207.072 199.212 203.663 190.645 201.736 187.829Z" 
      stroke="white"
       {...bodyPartProps['fessier-gauche-lateral']}/>
      <Path 
        id="biceps-femoral-gauche" 
        d="M185.284 218.065C185.164 218.119 185.038 218.173 184.906 218.228C182.968 219.574 177.096 228.834 180.393 230.071C183.239 231.138 184.839 233.776 185.284 234.962C182.32 234.813 173.368 235.317 161.273 238.519C146.155 242.521 134.15 242.521 119.032 239.853C106.937 237.718 101.246 226.217 99.9119 220.733C102.046 223.579 105.84 224.883 107.471 225.179C108.212 225.476 115.652 225.891 139.485 225.179C162.781 224.484 179.194 220.617 184.906 218.228C185.058 218.122 185.187 218.065 185.284 218.065Z" 
      stroke="white"
      {...bodyPartProps['biceps-femoral-gauche']}/>
      <Path 
        id="tibiat-anterieur-gauche" 
        d="M87.017 246.967C84.1712 241.276 84.3491 229.774 84.7937 224.735L86.1275 231.404C87.3132 230.812 90.3072 229.359 92.7972 228.292C95.2872 227.225 98.2812 223.104 99.4669 221.177C99.4669 226.513 108.953 234.962 113.696 238.519C109.071 238.163 108.508 246.078 108.805 250.08C109.694 252.303 110.672 262.085 107.471 283.428C104.269 304.771 105.247 327.3 106.137 335.896L97.2437 331.005C95.7615 329.968 92.0858 327.092 89.24 323.891C86.3943 320.69 82.4221 320.482 80.7917 320.778C83.3114 314.702 88.084 300.68 87.017 293.21C85.9499 285.74 86.5724 279.426 87.017 277.203C88.2027 269.496 89.8627 252.659 87.017 246.967Z" 
      stroke="white"
      {...bodyPartProps['tibiat-anterieur-gauche']}/>
      <Path 
        id="tibiat-gauche-lateral" 
        d="M116.364 281.649C116.008 287.341 109.101 308.921 105.692 319C103.202 311.174 106.73 282.242 108.805 268.755C109.249 265.79 109.872 257.727 108.805 249.19C107.738 240.653 111.917 238.519 114.14 238.519C115.623 238.963 119.12 243.321 121.255 257.194C123.389 271.067 118.883 279.278 116.364 281.649Z" 
      stroke="white"
      {...bodyPartProps['tibiat-gauche-lateral']}/>
      <Path 
        id="tibiat-gauche-lateral-1" 
        d="M88.7955 259.417C88.4398 268.666 86.8687 277.796 86.1277 281.205C84.9419 275.128 82.8373 261.907 83.9044 257.639C85.2384 252.303 86.1277 242.521 86.1277 243.41C86.1277 244.299 89.2402 247.856 88.7955 259.417Z" 
      stroke="white"
      {...bodyPartProps['tibiat-gauche-lateral-1']}/>
      <Path 
        id="pied-gauche-anterieur" 
        d="M70.5654 329.227C75.1898 325.314 79.3102 321.964 80.7923 320.778C86.1282 320.778 87.4618 322.112 91.4637 326.559C94.6651 330.116 102.876 334.266 106.582 335.896C106.137 335.6 105.248 332.161 105.248 320.778C105.248 309.395 106.137 313.961 106.582 317.666C105.692 322.557 109.25 326.114 109.694 332.339C110.139 338.564 107.471 342.566 102.58 342.566C97.6887 342.566 93.6869 344.345 87.4618 347.013C82.4818 349.147 74.1225 350.273 70.5654 350.57C44.3312 352.348 46.9991 343.9 48.3331 342.566C49.4002 341.499 57.6707 336.489 61.6725 334.118C62.71 334.118 65.9411 333.14 70.5654 329.227Z" 
      stroke="white"
      {...bodyPartProps['pied-gauche-anterieur']}/>
      <Path 
        id="pied-droit-anterieur" 
        d="M23.5466 317.144C30.3053 312.164 36.4414 308.844 38.6646 307.806C38.0736 308.103 39.0247 308.874 47.5576 309.585C56.0905 310.296 62.6738 314.921 64.8989 317.144C69.3453 324.703 60.0077 328.705 55.5613 328.26C52.0041 327.904 46.0755 327.519 43.5558 327.371C41.1843 327.964 35.2854 329.683 30.661 331.817C26.0367 333.952 20.1377 333.596 17.7663 333.151C17.1734 334.189 13.6754 335.641 4.42679 333.151C-4.82187 330.661 5.31608 324.703 11.5411 322.035C12.7269 322.48 16.788 322.124 23.5466 317.144Z" 
        stroke="white"
        {...bodyPartProps['pied-droit-anterieur']}/>
      <Path 
        id="triceps-gauche" 
        d="M221.248 128.169C221.604 123.9 219.914 115.719 219.025 112.162C215.823 117.853 211.169 121.351 209.243 122.389C208.946 125.797 207.909 134.394 207.909 141.508C207.909 142.842 211.99 150.432 212.355 152.625C213.244 157.96 212.355 160.628 213.244 162.851C214.4 165.741 215.912 171.744 217.246 173.968C218.313 175.746 217.691 177.969 217.246 178.859C219.025 177.436 220.062 154.551 220.359 143.287C220.507 140.026 220.892 132.438 221.248 128.169Z" 
      stroke="white"
      {...bodyPartProps['triceps-gauche']}/>
      </Svg>
    );

}
