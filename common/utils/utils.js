import { Dimensions } from 'react-native';

// eslint-disable-next-line import/prefer-default-export
export const Util = {
    size: {
        width: Dimensions.get('window').width,
        height: Dimensions.get('window').height,
    },
};
