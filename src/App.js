import React, { useEffect, useState } from 'react'
import styled, { createGlobalStyle } from 'styled-components'
import { EnvNames, NetworkNames, Sdk } from 'etherspot'

const GlobalStyle = createGlobalStyle`
  body {
    font-family: "Open Sans", sans;
  }

  * {
    margin: 0;
    padding: 0;
  }
`;

const Wrapper = styled.div`
  margin: 50px auto 0;
  width: 500px;
`;

const Input = styled.input`
  width: 470px;
  padding: 10px 15px;
  color: #000;
  border: 1px solid #000;
  border-radius: 5px;

  &:focus {
    outline: none;
  }
`;

const HelperText = styled.p`
  text-align: center;
`;

const InputHelperText = styled.p`
  text-align: center;
  font-size: 13px;
  margin: 10px 0 50px;
`;

const TokenWrapper = styled.div`
  display: flex;
  flex-direction: row;
  margin-bottom: 20px;
  align-items: center;
  padding: 25px;
  border: 1px solid #000;
  border-radius: 5px;
`;


const TokenDetails = styled.div`
  font-size: 13px;
  display: flex;
  flex-direction: column;
  align-items: flex-start
`;

const TokenImage = styled.img`
  width: 50px;
  margin-right: 20px;
`;

const ChainWrapper = styled.span`
  background: ${({ $backgroundColor }) => $backgroundColor};
  color: ${({ $textColor }) => $textColor};
  padding: 5px;
  margin-bottom: 5px;
  border-radius: 5px;
`;

const getChainNameById = (chainId) => {
  if (chainId === 1) return 'Ethereum Mainnet';
  if (chainId === 137) return 'Polygon';
  if (chainId === 100) return 'xDai';
  if (chainId === 56) return 'Binance Smart Chain';

  return 'Unidentified'
}


const getBackgroundColorByChainId = (chainId) => {
  if (chainId === 1) return '#62688F'; // ethereum mainnet
  if (chainId === 137) return '#8247e5'; // polygon
  if (chainId === 100) return '#62a7a5'; // xdai
  if (chainId === 56) return '#f3ba2f'; // binance

  return '#ddd' // unidentified
}

const getTextColorByChainId = (chainId) => {
  if (chainId === 1) return '#fff'; // ethereum mainnet
  if (chainId === 137) return '#fff'; // polygon
  if (chainId === 100) return '#fff'; // xdai
  if (chainId === 56) return '#000'; // binance

  return '#000' // unidentified
}

const fetchCrossChainTokens = async () => {
  const privateKey = '0x1e3ab351be3514ccf4ce0d1409b9e169e58d6f9330a145d647b24a9d52562cf9'; // random
  const chains = [
    { networkName: NetworkNames.Mainnet, tokenListName: 'PillarTokens' },
    { networkName: NetworkNames.Matic, tokenListName: 'PillarTokens' },
    { networkName: NetworkNames.Bsc, tokenListName: 'PillarTokens' },
    { networkName: NetworkNames.Xdai, tokenListName: null },
  ];

  let crossChainTokens = [
    {
      name: 'Ethereum',
      chainId: 1,
      address: null,
      symbol: 'ETH',
      decimals: 18,
      logoURI: 'https://tokens.1inch.exchange/0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee.png',
    },
    {
      name: 'Matic',
      chainId: 137,
      address: null,
      symbol: 'MATIC',
      decimals: 18,
      logoURI: 'https://tokens.1inch.exchange/0x7d1afa7b718fb893db30a3abc0cfc608aacfebb0.png',
    },
    {
      name: 'BNB',
      chainId: 56,
      address: null,
      symbol: 'BNB',
      decimals: 18,
      logoURI: 'https://tokens.1inch.exchange/0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c.png',
    },
    {
      name: 'xDAI',
      chainId: 100,
      address: null,
      symbol: 'xDAI',
      decimals: 18,
      logoURI: 'https://tokens.1inch.exchange/0x6b175474e89094c44da98b954eedeac495271d0f.png',
    }
  ];

  await Promise.all(chains.map(async ({ networkName, tokenListName }) => {
    const chainInstance = new Sdk(privateKey, { env: EnvNames.MainNets, networkName });
    const chainTokens = await chainInstance.getTokenListTokens({ name: tokenListName });
    crossChainTokens = [...crossChainTokens, ...chainTokens];
  }));

  return crossChainTokens;
};

const App = () => {
  const [tokens, setTokens] = useState([]);
  const [query, setQuery] = useState('');

  const fetchAndSetCrossChainTokens = async () => {
    const crossChainTokens = await fetchCrossChainTokens();
    setTokens(crossChainTokens);
  }

  useEffect(() => {
    fetchAndSetCrossChainTokens();
  }, []);

  const onChange = (event) => {
    const value = event.target.value;
    setQuery(value ?? '');
  };

  const foundTokens = query.length < 3
    ? []
    : tokens.filter(({ symbol, address, name }) => {
      const matchQuery = query.toUpperCase();
      return symbol.toUpperCase().includes(matchQuery)
        || address.toUpperCase().includes(matchQuery)
        || name.toUpperCase().includes(matchQuery)
    });

  return (
    <Wrapper>
      <GlobalStyle />
      {!tokens?.length && <HelperText>Loading tokens...</HelperText>}
      {!!tokens?.length && (
        <>
          <Input placeholder="Enter token symbol, address or name" onChange={onChange} />
          <InputHelperText>Tokens shown should match tokens in app. Refresh page to get latest.</InputHelperText>
        </>
      )}
      {foundTokens.map(({ name, address, decimals, logoURI, chainId }) => (
        <TokenWrapper>
          <TokenImage src={logoURI} />
          <TokenDetails>
            <ChainWrapper
              $textColor={getTextColorByChainId(chainId)}
              $backgroundColor={getBackgroundColorByChainId(chainId)}
            >
              Chain: {getChainNameById(chainId)} (ID: {chainId})
            </ChainWrapper>
            <span>Name: {name}</span>
            <span>Address: {address}</span>
            <span>Decimals: {decimals}</span>
          </TokenDetails>
        </TokenWrapper>
      ))}
    </Wrapper>
  );
}

export default App;
