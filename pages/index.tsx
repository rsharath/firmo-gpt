import { Answer } from "@/components/Answer/Answer";
import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/Navbar";
import { WBWChunk } from "@/types";
import { getImage } from "@/utils/images";
import { IconArrowRight, IconExternalLink, IconSearch } from "@tabler/icons-react";
import endent from "endent";
import Head from "next/head";
import Image from "next/image";
import { KeyboardEvent, useEffect, useRef, useState } from "react";

export default function Home() {
  const inputRef = useRef<HTMLInputElement>(null);

  const [query, setQuery] = useState<string>("");
  const [chunks, setChunks] = useState<WBWChunk[]>([]);
  const [answer, setAnswer] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [mode, setMode] = useState<"search" | "chat">("chat");

  const [matchCount, setMatchCount] = useState<number>(5);
  const [apiKey, setApiKey] = useState<string>("");

  const handleSearch = async () => {
    if (!apiKey) {
      alert("Please enter an API key.");
      return;
    }

    if (!query) {
      alert("Please enter a query.");
      return;
    }

    setAnswer("");
    setChunks([]);

    setLoading(true);

    const searchResponse = await fetch("/api/search", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ query, apiKey, matches: matchCount })
    });

    if (!searchResponse.ok) {
      setLoading(false);
      throw new Error(searchResponse.statusText);
    }

    const results: WBWChunk[] = await searchResponse.json();

    setChunks(results);

    setLoading(false);

    return results;
  };

  const handleAnswer = async () => {
    if (!apiKey) {
      alert("Please enter an API key.");
      return;
    }

    if (!query) {
      alert("Please enter a query.");
      return;
    }

    setAnswer("");
    setChunks([]);

    setLoading(true);

    // fetch from supabase
    /*
    const searchResponse = await fetch("/api/search", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ query, apiKey, matches: matchCount })
    });

    if (!searchResponse.ok) {
      setLoading(false);
      throw new Error(searchResponse.statusText);
    }

    const results: WBWChunk[] = await searchResponse.json();

    setChunks(results);
*/
    const results : WBWChunk[] = [];
    const prompt = endent`
    Use the following passages to provide an answer to the query: "${query}"

    ${results?.map((d: any) => d.content).join("\n\n")}
    `;  

    //call openai 
    const answerResponse = await fetch("/api/answer", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ prompt, apiKey })
    });

    if (!answerResponse.ok) {
      setLoading(false);
      throw new Error(answerResponse.statusText);
    }

    const data = answerResponse.body;

    if (!data) {
      return;
    }

    setLoading(false);

    const reader = data.getReader();
    const decoder = new TextDecoder();
    let done = false;

    while (!done) {
      const { value, done: doneReading } = await reader.read();
      done = doneReading;
      const chunkValue = decoder.decode(value);
      setAnswer((prev) => prev + chunkValue);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      if (mode === "search") {
       // handleSearch();
       handleAnswer();
      } else {
        handleAnswer();
      }
    }
  };

  const handleSave = () => {
    if (apiKey.length !== 51) {
      alert("Please enter a valid API key.");
      return;
    }

    localStorage.setItem("WBW_KEY", apiKey);
    localStorage.setItem("WBW_MATCH_COUNT", matchCount.toString());
    localStorage.setItem("WBW_MODE", mode);

    setShowSettings(false);
  };

  const handleClear = () => {
    localStorage.removeItem("WBW_KEY");
    localStorage.removeItem("WBW_MATCH_COUNT");
    localStorage.removeItem("WBW_MODE");

    setApiKey("");
    setMatchCount(5);
    setMode("search");
  };

  useEffect(() => {
    if (matchCount > 10) {
      setMatchCount(10);
    } else if (matchCount < 1) {
      setMatchCount(1);
    }
  }, [matchCount]);

  useEffect(() => {
    const WBW_KEY = localStorage.getItem("WBW_KEY");
    const WBW_MATCH_COUNT = localStorage.getItem("WBW_MATCH_COUNT");
    const WBW_MODE = localStorage.getItem("WBW_MODE");
    if (process.env.NEXT_PUBLIC_OPENAI_API_KEY) {
     setApiKey(process.env.NEXT_PUBLIC_OPENAI_API_KEY);
    }

    if (WBW_KEY) {
      setApiKey(WBW_KEY);
    }

    if (WBW_MATCH_COUNT) {
      setMatchCount(parseInt(WBW_MATCH_COUNT));
    }

    if (WBW_MODE) {
      setMode(WBW_MODE as "search" | "chat");
    }
  }, []);

  return (
    <>
      <Head>
        <title>Firmo-GPT</title>
        <meta
          name="description"
          content={`AI-powered search for Company Firmographics"`}
        />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1"
        />
        <link
          rel="icon"
          href="/favicon.ico"
        />
      </Head>

      <div className="flex flex-col h-screen">
        <Navbar />
        <div className="flex-1 overflow-auto">
          <div className="mx-auto flex h-full w-full max-w-[750px] flex-col items-center px-3 pt-4 sm:pt-8">
            <button
              className="mt-4 flex cursor-pointer items-center space-x-2 rounded-full border border-zinc-600 px-3 py-1 text-sm hover:opacity-50"
              onClick={() => setShowSettings(!showSettings)}
            >
              {showSettings ? "Hide" : "Show"} Settings
            </button>

            {showSettings && (
              <div className="w-[340px] sm:w-[400px]">
                <div>
                  <div>Mode</div>
                  <select
                    className="max-w-[400px] block w-full cursor-pointer rounded-md border border-gray-300 p-2 text-black shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 sm:text-sm"
                    value={mode}
                    onChange={(e) => setMode(e.target.value as "search" | "chat")}
                  >
                    <option value="search">Search</option>
                    <option value="chat">Chat</option>
                  </select>
                </div>

                {apiKey.length !== 51 && !process.env.NEXT_PUBLIC_OPENAI_API_KEY ? (
                  <div className="mt-2">
                    <div>OpenAI API Key</div>
                    <input
                      type="password"
                      placeholder="OpenAI API Key"
                      className="max-w-[400px] block w-full rounded-md border border-gray-300 p-2 text-black shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 sm:text-sm"
                      value={apiKey}
                      onChange={(e) => {
                        setApiKey(e.target.value);

                        if (e.target.value.length !== 51) {
                          setShowSettings(true);
                        }
                      }}
                    />
                  </div>
                ) : null}

                <div className="mt-4 flex space-x-2 justify-center">
                  <div
                    className="flex cursor-pointer items-center space-x-2 rounded-full bg-green-500 px-3 py-1 text-sm text-white hover:bg-green-600"
                    onClick={handleSave}
                  >
                    Save
                  </div>

                  <div
                    className="flex cursor-pointer items-center space-x-2 rounded-full bg-red-500 px-3 py-1 text-sm text-white hover:bg-red-600"
                    onClick={handleClear}
                  >
                    Clear
                  </div>
                </div>
              </div>
            )}

            {apiKey.length === 51 ? (
              <div className="relative w-full mt-4">
                <IconSearch className="absolute top-3 w-10 left-1 h-6 rounded-full opacity-50 sm:left-3 sm:top-4 sm:h-8" />

                <input
                  ref={inputRef}
                  className="h-12 w-full rounded-full border border-zinc-600 pr-12 pl-11 focus:border-zinc-800 focus:outline-none focus:ring-1 focus:ring-zinc-800 sm:h-16 sm:py-2 sm:pr-16 sm:pl-16 sm:text-lg"
                  type="text"
                  placeholder="Tell me about Exxon Mobil?"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                />

                <button>
                  <IconArrowRight
                    onClick={mode === "search" ? handleAnswer : handleAnswer}
                    className="absolute right-2 top-2.5 h-7 w-7 rounded-full bg-blue-500 p-1 hover:cursor-pointer hover:bg-blue-600 sm:right-3 sm:top-3 sm:h-10 sm:w-10 text-white"
                  />
                </button>
              </div>
            ) : (
              <div className="text-center font-bold text-3xl mt-7">
                Please enter your
                <a
                  className="mx-2 underline hover:opacity-50"
                  href="https://openai.com/product"
                >
                  OpenAI API key
                </a>
                in settings.
              </div>
            )}

            {loading ? (
              <div className="mt-6 w-full">
                {mode === "chat" && (
                  <>
                    
                  </>
                )}

                <div className="font-bold text-2xl mt-6">generating json...</div>
                <div className="animate-pulse mt-2">
                  <div className="h-4 bg-gray-300 rounded"></div>
                  <div className="h-4 bg-gray-300 rounded mt-2"></div>
                  <div className="h-4 bg-gray-300 rounded mt-2"></div>
                  <div className="h-4 bg-gray-300 rounded mt-2"></div>
                  <div className="h-4 bg-gray-300 rounded mt-2"></div>
                </div>
              </div>
            ) : answer ? (
              <div className="mt-6">
             

                <div className="mt-6 mb-16">
                  <div className="font-bold text-2xl">json</div>

                  <div>
                      <div className="mt-4 border border-zinc-600 rounded-lg p-4">
                        <div className="mt-4">
                          <pre style={{ whiteSpace: "pre-wrap" }}>
                            {JSON.stringify(answer).replace(/\\([\\"])/g, '$1').replace(/\\n/g, '\n')}
                          </pre>                        
                        </div>
                      </div>
                  </div>
              
                </div>
              </div>
            ) : chunks.length > 0 ? (
              <div className="mt-6 pb-16">
                <div className="font-bold text-2xl">Passages</div>
                {chunks.map((chunk, index) => (
                  <div key={index}>
                    <div className="mt-4 border border-zinc-600 rounded-lg p-4">
                      <div className="flex justify-between">
                        <div className="flex items-center">
                          <Image
                            className="rounded-lg"
                            src={getImage(chunk.post_title)}
                            width={103}
                            height={70}
                            alt={chunk.post_title}
                          />
                          <div className="ml-4">
                            <div className="font-bold text-xl">{chunk.post_title}</div>
                            <div className="mt-1 font-bold text-sm">{chunk.post_date}</div>
                          </div>
                        </div>
                        <a
                          className="hover:opacity-50 ml-2"
                          href={chunk.post_url}
                          target="_blank"
                          rel="noreferrer"
                        >
                          <IconExternalLink />
                        </a>
                      </div>
                      <div className="mt-4">{chunk.content}</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="mt-6 text-center text-lg">{`AI-powered search for Company Firmographics`}</div>
            )}
          </div>
        </div>
        <Footer />
      </div>
    </>
  );
}
