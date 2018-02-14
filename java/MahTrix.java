package se.silentdesign.graphics.mahtrix;
import java.applet.Applet;
import java.awt.*;
import java.awt.event.KeyEvent;
import java.awt.event.KeyListener;
import java.util.ArrayList;

public class MahTrix extends Applet implements Runnable, KeyListener {

  private class Word {

    StringBuffer word;
    int x, y;

    public Word() {
      reset();
    }

    public synchronized void reset() {
      int l;
      if (Math.random() < 0.5d) { // 50% chance to make a short word
        l = 1 + (int) (Math.random() * 3); // 1-4 letter words
      }
      else {
        l = 5 + (int) (Math.random() * 7); // 5-12 letter words
      }
      word = new StringBuffer(l);
      for (int i = 0; i < l; i++) {
        word.append(i);
      }
      // set random location on screen
      x = (int) (Math.random() * MahTrix.HORIZONTAL_TILES);
      y = -word.length() - (int) (Math.random() * 5);
    }

    public int getLength() {
      return word.length();
    }

    public char get(int i) {
      try {
        return word.charAt(i);
      }
      catch (Exception e) {
        System.err.println(e.getMessage());
        return randomChar();
      }
    }

    public void update() {
      boolean moving = false;
      if (word.length() < 7 || Math.random() < 0.3d) { // long words has a chance to occasionally pause
        y++;
        moving = true;
      }
      for (int i = 0; i < word.length(); i++) { // for each character in the word
        if (moving && Math.random() < 0.8d) { // ... push character upwards
          if (i < word.length() - 1) {
            char c = word.charAt(i);
            word.setCharAt(i, word.charAt(i + 1));
            word.setCharAt(i + 1, c);
          }
        }
        else if (Math.random() < 0.1d) { // small chance to just randomly change to another character
          word.setCharAt(i, randomChar());
          //word.setCharAt(i, (char)(65 + (Math.random() * 25)));
        }
      }
    }

    private char randomChar() {
      return (char) (97 + ((int) (Math.random() * 25)));
    }

  }

  private static final long serialVersionUID = 1L;
  private static final int RAMPED_COLORS = 15;
  static int TILE_SIZE = 28, VERTICAL_TILES, HORIZONTAL_TILES;
  private int NUM_WORDS, TARGET_NUM_WORDS;
  private boolean NEED_RESIZE = false;

  // render variables
  private int w, h;
  private Color bgColor, fgColor;
  private Image backBufferImage;
  private Graphics2D backBuffer;

  private ArrayList<Word> words;
  private Color[] colors;
  private Font font;
  private Thread thread;

  public void init() {

    bgColor = new Color(4, 15, 6);
    fgColor = Color.GREEN;
    setBackground(bgColor);

    // pre-calc faded colors
    colors = new Color[RAMPED_COLORS];
    for (int i = 0; i < colors.length; i++) {
      colors[i] = getRampedColor(new Color(10, 25, 10), fgColor, colors.length, i + 1);
    }

    w = getWidth();
    h = getHeight();
    VERTICAL_TILES = h / TILE_SIZE;
    HORIZONTAL_TILES = w / TILE_SIZE;
    NUM_WORDS = (VERTICAL_TILES * HORIZONTAL_TILES) / 4;
    TARGET_NUM_WORDS = NUM_WORDS;

    words = new ArrayList<Word>(NUM_WORDS * 3);

    for (int i = 0; i < NUM_WORDS; i++) {
      words.add(new Word());
    }

    backBufferImage = createImage(w, h);
    backBuffer = (Graphics2D) backBufferImage.getGraphics();
    backBuffer.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);

    String fontName = getParameter("fontName");
    String fontSize = getParameter("fontSize");

    if (fontName != null && fontSize != null) {
      font = new Font(fontName, Font.PLAIN, Integer.parseInt(fontSize));
    }
    else {
      font = new Font("Matrix Code NFI", Font.PLAIN, 24);
    }
    backBuffer.setFont(font);

    addKeyListener(this);

  }

  private Color getRampedColor(Color c1, Color c2, int max, int index) {

    if (max < index) {
      return c2;
    }

    // sine ramping
    float[] low = c1.getRGBComponents(null);
    float[] high = c2.getRGBComponents(null);
    float[] rgb = new float[3];

    for (int i = 0; i < rgb.length; i++) {
      rgb[i] = high[i] - (high[i] - low[i]) * (float) Math.sin(Math.PI / 2.0D - Math.PI / 2.0D / max * index);
      //rgb[i] = rgbHigh[i] - ()
    }
    return new Color(rgb[0], rgb[1], rgb[2]);
  }

  public void run() {

    while (true) {
      try {
        checkSize();
        recalc();
        repaint();
        showStatus(String.format("%d:%d", NUM_WORDS, TARGET_NUM_WORDS));
        Thread.sleep(50);
      }
      catch (Exception e) {
        System.err.println("MahTrix thread interrupted.");
        //e.printStackTrace();
      }
    }
  }

  private void checkSize() {

    int dw = getWidth();
    int dh = getHeight();
    if (dw != w || dh != h) {
      w = dw;
      h = dh;
      VERTICAL_TILES = h / TILE_SIZE;
      HORIZONTAL_TILES = w / TILE_SIZE;
      //NUM_WORDS = VERTICAL_TILES * HORIZONTAL_TILES / 5;
      TARGET_NUM_WORDS = (VERTICAL_TILES * HORIZONTAL_TILES) / 7;

      NEED_RESIZE = true;
    }

  }

  public void start() {
    if (thread == null) {
      thread = new Thread(this);
      thread.start();
    }
  }

  public void stop() {
    if (thread != null) {
      thread.interrupt();
      thread = null;
    }
  }

  public void recalc() {
    Word word;
    if (TARGET_NUM_WORDS > NUM_WORDS) {
      for (int i = 0; i < 3; i++) {
        NUM_WORDS++;
        words.add(new Word());
      }
    }
    for (int i = 0; i < words.size(); i++) {
      word = words.get(i);
      word.update();
      if (word.y > VERTICAL_TILES + word.getLength()) {
        if (TARGET_NUM_WORDS < NUM_WORDS) {
          words.remove(i);
          NUM_WORDS--;
        }
        else {
          word.reset();
        }
      }
      else if (word.x > HORIZONTAL_TILES) {
        word.reset();
      }
    }
  }

  public void update(Graphics g) {
    // override for improved speed
    paint(g);
  }

  public void paint(Graphics g) {

    if (NEED_RESIZE) {
      backBufferImage = createImage(w, h);
      backBuffer = (Graphics2D) backBufferImage.getGraphics();
      backBuffer.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);
      backBuffer.setFont(font);
      NEED_RESIZE = false;
    }

    backBuffer.setColor(bgColor);
    backBuffer.fillRect(0, 0, w, h);

    int x, y, l;
    Word word;
    for (int i = 0; i < words.size(); i++) {

      word = words.get(i);
      x = word.x * TILE_SIZE;
      l = word.getLength();

      for (int j = 0; j < l; j++) {
        y = (word.y + j) * TILE_SIZE;
        if (y > 0 && y < 2 * TILE_SIZE + TILE_SIZE * VERTICAL_TILES) {
          backBuffer.setColor(bgColor);
          backBuffer.fillRect(x, y - 30, TILE_SIZE, TILE_SIZE);
          backBuffer.setColor(colors[l - (int) Math.floor(l / (j == 0 ? 1 : j))]);
          backBuffer.drawString(Character.toString(word.get(j)), x + 12, y - 10);
        }
      }

    }
    g.drawImage(backBufferImage, 0, 0, this);
  }

  public void keyPressed(KeyEvent e) {

    if (e.getKeyCode() == KeyEvent.VK_SPACE) {
      for (int i = 0; i < words.size(); i++) {
        Word word = words.get(i);
        if (word != null) {
          word.reset();
        }
      }
    }

  }

  public void keyReleased(KeyEvent e) {
  }

  public void keyTyped(KeyEvent e) {
  }

}
